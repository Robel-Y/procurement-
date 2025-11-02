class ExternalApiService {
  constructor() {
    // This is the URL of the EXTERNAL SYSTEM that will RECEIVE your data
    this.apiUrl =
      process.env.EXTERNAL_SYSTEM_URL ||
      "https://api.other-company.com/receive-purchase-requests";
    this.apiKey =
      process.env.EXTERNAL_SYSTEM_API_KEY || "your-secret-key-for-their-api";
    this.timeout = parseInt(process.env.EXTERNAL_SYSTEM_TIMEOUT) || 10000;
  }

  /**
   * SEND purchase request data TO external system
   * This is OUTBOUND - your system → their system
   */
  async sendPurchaseRequestToExternal(purchaseRequest) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log("🔄 SENDING purchase request to external system:", {
        requestId: purchaseRequest._id,
        title: purchaseRequest.title,
        externalUrl: this.apiUrl,
      });

      // Prepare the data to send
      const payload = this.prepareOutboundPayload(purchaseRequest);

      // MAKE THE OUTBOUND POST REQUEST to their API using fetch
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "Your-Procurement-System/1.0",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ FAILED to send to external system:", {
          status: response.status,
          theirError: data,
        });

        return {
          success: false,
          error: data,
          statusCode: response.status,
        };
      }

      console.log("✅ SUCCESS: External system accepted our data:", {
        status: response.status,
        externalId: data.id,
        theirResponse: data,
      });

      return {
        success: true,
        data,
        externalId: data.id || data.requestId,
        statusCode: response.status,
      };
    } catch (error) {
      console.error("❌ FAILED to send to external system:", {
        message:
          error.name === "AbortError" ? "Request timed out" : error.message,
      });

      return {
        success: false,
        error:
          error.name === "AbortError" ? "Request timed out" : error.message,
        statusCode: 500,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Format OUR data for THEIR system
   * Transform our internal format to what the external system expects
   */
  prepareOutboundPayload(purchaseRequest) {
    return {
      request_title: purchaseRequest.title,
      request_description: purchaseRequest.description,
      product_category: purchaseRequest.category,
      requested_quantity: purchaseRequest.quantity,
      budget_amount: purchaseRequest.budget,
      urgency_level: purchaseRequest.urgency,
      requester: {
        full_name: purchaseRequest.requestedBy?.name,
        email_address: purchaseRequest.requestedBy?.email,
        department: purchaseRequest.requestedBy?.department,
      },
      approval_status: purchaseRequest.status,
      assigned_approver: purchaseRequest.currentApprover
        ? {
            name: purchaseRequest.currentApprover.name,
            email: purchaseRequest.currentApprover.email,
          }
        : null,
      internal_reference_id: purchaseRequest._id.toString(),
      submitted_at: purchaseRequest.createdAt,
      source_system: "your_procurement_system_v1",
    };
  }

  /**
   * Optional: Check if our sent data was processed by their system
   */
  async checkExternalRequestStatus(externalId) {
    try {
      const response = await fetch(`${this.apiUrl}/status/${externalId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch external status");
      }

      return {
        success: true,
        status: data.status,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new ExternalApiService();

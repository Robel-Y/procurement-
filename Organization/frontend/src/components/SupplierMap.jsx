// src/components/SupplierMap.jsx
import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Mock supplier data
const mockSuppliers = [
  {
    id: 1,
    name: "Tech Supplies Inc.",
    description: "Computer hardware and office equipment",
    latitude: 9.033,
    longitude: 38.7,
    address: "123 Tech Street, Addis Ababa",
    contact: "tech@example.com",
    phone: "+251-911-123456",
    category: "Technology",
  },
  {
    id: 2,
    name: "Office Solutions Ltd.",
    description: "Office furniture and supplies",
    latitude: 9.021,
    longitude: 38.75,
    address: "456 Office Ave, Addis Ababa",
    contact: "office@example.com",
    phone: "+251-911-654321",
    category: "Office",
  },
  {
    id: 3,
    name: "Industrial Parts Co.",
    description: "Industrial equipment and parts",
    latitude: 9.04,
    longitude: 38.72,
    address: "789 Industry Blvd, Addis Ababa",
    contact: "industrial@example.com",
    phone: "+251-911-789012",
    category: "Industrial",
  },
];

// Haversine formula to calculate distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

const SupplierMap = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user's actual location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback to Addis Ababa center
          setUserLocation({ lat: 9.02, lng: 38.72 });
          setLoading(false);
        }
      );
    } else {
      // Fallback if geolocation not supported
      setUserLocation({ lat: 9.02, lng: 38.72 });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userLocation || !mapContainerRef.current) return;

    // Initialize the map
    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [userLocation.lng, userLocation.lat],
      zoom: 13,
    });

    // Add navigation controls
    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add scale control
    mapRef.current.addControl(new maplibregl.ScaleControl(), "bottom-left");

    // Wait for map to load
    mapRef.current.on("load", () => {
      // Add user location marker with custom color
      new maplibregl.Marker({ color: "#10b981" })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <h4 style="margin: 0 0 8px 0; color: #10b981;">📍 Your Location</h4>
              <p style="margin: 0; font-size: 12px; color: #666;">
                Lat: ${userLocation.lat.toFixed(4)}<br/>
                Lng: ${userLocation.lng.toFixed(4)}
              </p>
            </div>
          `)
        )
        .addTo(mapRef.current);

      // Add supplier markers
      mockSuppliers.forEach((supplier) => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          supplier.latitude,
          supplier.longitude
        );

        const popupHTML = `
          <div style="min-width: 250px; padding: 8px;">
            <h4 style="margin: 0 0 8px 0; color: #3b82f6;">${supplier.name}</h4>
            <p style="margin: 0 0 8px 0; font-size: 14px;">${supplier.description}</p>
            <div style="font-size: 12px; color: #666;">
              <p style="margin: 4px 0;"><strong>📍 Address:</strong> ${supplier.address}</p>
              <p style="margin: 4px 0;"><strong>📧 Contact:</strong> ${supplier.contact}</p>
              <p style="margin: 4px 0;"><strong>📞 Phone:</strong> ${supplier.phone}</p>
              <p style="margin: 4px 0;"><strong>🏷️ Category:</strong> ${supplier.category}</p>
              <p style="margin: 8px 0 0 0; padding: 8px; background: #f0fdf4; border-radius: 4px; color: #059669;">
                <strong>📏 Distance:</strong> ${distance} km away
              </p>
            </div>
          </div>
        `;

        const marker = new maplibregl.Marker({ color: "#3b82f6" })
          .setLngLat([supplier.longitude, supplier.latitude])
          .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(popupHTML))
          .addTo(mapRef.current);

        // Add click handler to update selected supplier
        marker.getElement().addEventListener("click", () => {
          setSelectedSupplier({ ...supplier, distance });
        });
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [userLocation]);

  if (loading) {
    return (
      <div className="card text-center p-4">
        <div className="spinner"></div>
        <p>Loading supplier map...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card-header mb-3">
        <h2 className="card-title mb-1">Supplier Locations</h2>
        <p style={{ color: "var(--text-light)" }}>
          Interactive map showing all supplier locations with real-time
          distances
        </p>
      </div>

      <div className="card">
        <div className="row">
          {/* Map Column */}
          <div className="col-8">
            <div
              ref={mapContainerRef}
              style={{
                height: "500px",
                borderRadius: "8px",
              }}
            />
          </div>

          {/* Supplier List Column */}
          <div className="col-4">
            <div className="p-3">
              <h4>Supplier List</h4>
              <div
                className="supplier-list"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                {mockSuppliers.map((supplier) => {
                  const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    supplier.latitude,
                    supplier.longitude
                  );

                  return (
                    <div
                      key={supplier.id}
                      className={`supplier-item p-3 mb-2 ${
                        selectedSupplier?.id === supplier.id ? "active" : ""
                      }`}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background:
                          selectedSupplier?.id === supplier.id
                            ? "var(--hover)"
                            : "transparent",
                      }}
                      onClick={() => {
                        setSelectedSupplier({ ...supplier, distance });
                        // Fly to the supplier location on map
                        mapRef.current.flyTo({
                          center: [supplier.longitude, supplier.latitude],
                          essential: true,
                        });
                      }}
                    >
                      <div className="d-flex justify-between align-start">
                        <div style={{ flex: 1 }}>
                          <h5
                            style={{
                              margin: "0 0 4px 0",
                              color: "var(--primary)",
                            }}
                          >
                            {supplier.name}
                          </h5>
                          <p
                            style={{
                              margin: "0 0 8px 0",
                              fontSize: "0.875rem",
                              color: "var(--text-light)",
                            }}
                          >
                            {supplier.description}
                          </p>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-light)",
                            }}
                          >
                            <div>📍 {supplier.address}</div>
                            <div>🏷️ {supplier.category}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              color: "var(--success)",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                            }}
                          >
                            {distance} km
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Supplier Details */}
        {selectedSupplier && (
          <div className="p-3 border-top">
            <div className="row">
              <div className="col-8">
                <h4>{selectedSupplier.name}</h4>
                <p>{selectedSupplier.description}</p>
                <div className="row">
                  <div className="col-6">
                    <strong>📍 Address:</strong>
                    <p style={{ color: "var(--text-light)", margin: "4px 0" }}>
                      {selectedSupplier.address}
                    </p>
                  </div>
                  <div className="col-6">
                    <strong>📧 Contact:</strong>
                    <p style={{ color: "var(--text-light)", margin: "4px 0" }}>
                      {selectedSupplier.contact}
                    </p>
                  </div>
                  <div className="col-6">
                    <strong>📞 Phone:</strong>
                    <p style={{ color: "var(--text-light)", margin: "4px 0" }}>
                      {selectedSupplier.phone}
                    </p>
                  </div>
                  <div className="col-6">
                    <strong>🏷️ Category:</strong>
                    <p style={{ color: "var(--text-light)", margin: "4px 0" }}>
                      {selectedSupplier.category}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div
                  className="p-3 text-center"
                  style={{
                    background: "var(--success-light)",
                    borderRadius: "8px",
                    border: "1px solid var(--success)",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                    📏
                  </div>
                  <h3 style={{ color: "var(--success)", margin: "0" }}>
                    {selectedSupplier.distance} km
                  </h3>
                  <p style={{ color: "var(--text-light)", margin: "0" }}>
                    Distance from you
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierMap;

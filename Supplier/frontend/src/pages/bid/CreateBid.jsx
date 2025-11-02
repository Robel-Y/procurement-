// src/pages/bid/CreateBid.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { rfqAPI, bidAPI } from '../../services/api';
import { ArrowLeft, Plus, Trash2, Calculator } from 'lucide-react';

const CreateBid = () => {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rfq, setRfq] = useState(null);
  const [items, setItems] = useState([]);
  const [pricing, setPricing] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    totalAmount: 0
  });

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  useEffect(() => {
    fetchRFQ();
  }, [rfqId]);

  useEffect(() => {
    calculatePricing();
  }, [items]);

  const fetchRFQ = async () => {
    try {
      const response = await rfqAPI.getById(rfqId);
      setRfq(response.data.data);
      
      // Initialize bid items from RFQ items
      const initialItems = response.data.data.items.map(item => ({
        rfqItemId: item._id,
        itemName: item.itemName,
        description: item.description,
        quantity: item.quantity,
        uom: item.uom,
        unitPrice: 0,
        totalPrice: 0,
        leadTimeDays: 0
      }));
      setItems(initialItems);
    } catch (error) {
      console.error('Failed to fetch RFQ:', error);
      alert('Failed to load RFQ details');
    }
  };

  const calculatePricing = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const totalAmount = subtotal + (pricing.tax || 0) + (pricing.shipping || 0) - (pricing.discount || 0);
    
    setPricing(prev => ({
      ...prev,
      subtotal,
      totalAmount
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Calculate total price if unit price or quantity changes
    if (field === 'unitPrice' || field === 'quantity') {
      const unitPrice = field === 'unitPrice' ? parseFloat(value) : newItems[index].unitPrice;
      const quantity = field === 'quantity' ? parseInt(value) : newItems[index].quantity;
      newItems[index].totalPrice = unitPrice * quantity;
    }
    
    setItems(newItems);
  };

  const updatePricing = (field, value) => {
    setPricing(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const onSubmit = async (data) => {
    if (!user.supplierId) {
      alert('You must be associated with a supplier to submit bids');
      return;
    }

    setLoading(true);
    try {
      const bidData = {
        rfqId,
        supplierId: user.supplierId,
        items: items.filter(item => item.unitPrice > 0),
        pricing: {
          ...pricing,
          currency: 'ETB'
        },
        deliveryTerms: {
          estimatedDeliveryDate: data.estimatedDeliveryDate,
          deliveryLocation: data.deliveryLocation,
          shippingMethod: data.shippingMethod
        },
        paymentTerms: {
          method: data.paymentMethod,
          terms: data.paymentTerms,
          advancePaymentPercentage: parseFloat(data.advancePaymentPercentage) || 0
        },
        warranty: {
          duration: parseInt(data.warrantyDuration) || 0,
          unit: data.warrantyUnit,
          terms: data.warrantyTerms
        },
        notes: data.notes
      };

      await bidAPI.create(bidData);
      navigate('/my-bids');
    } catch (error) {
      console.error('Failed to submit bid:', error);
      alert('Failed to submit bid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!rfq) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={`/rfqs/${rfqId}`} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Submit Bid</h1>
            <p className="text-gray-600">for {rfq.title}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Bid Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Bid Items</h2>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900">{item.itemName}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Quantity: {item.quantity} {item.uom}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Price
                    </label>
                    <input
                      type="number"
                      value={item.totalPrice}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Time (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={item.leadTimeDays}
                      onChange={(e) => updateItem(index, 'leadTimeDays', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Pricing Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{pricing.subtotal.toLocaleString()} ETB</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricing.tax}
                    onChange={(e) => updatePricing('tax', e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span>ETB</span>
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricing.shipping}
                    onChange={(e) => updatePricing('shipping', e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span>ETB</span>
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricing.discount}
                    onChange={(e) => updatePricing('discount', e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span>ETB</span>
                </div>
              </div>
              
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-lg font-semibold text-gray-900">
                  {pricing.totalAmount.toLocaleString()} ETB
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value="ETB"
                  readOnly
                >
                  <option value="ETB">ETB - Ethiopian Birr</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until
                </label>
                <input
                  type="date"
                  {...register('validUntil')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Terms & Conditions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Terms */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Delivery Terms</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  {...register('estimatedDeliveryDate')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Location
                </label>
                <input
                  type="text"
                  {...register('deliveryLocation')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter delivery address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Method
                </label>
                <input
                  type="text"
                  {...register('shippingMethod')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Ground shipping, Express"
                />
              </div>
            </div>

            {/* Payment & Warranty */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Payment & Warranty</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  {...register('paymentMethod')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select payment method</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Payment (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  {...register('advancePaymentPercentage')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty Duration
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('warrantyDuration')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    {...register('warrantyUnit')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Terms
                </label>
                <textarea
                  rows={3}
                  {...register('warrantyTerms')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe warranty terms and conditions"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              rows={4}
              {...register('notes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional information or special conditions"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Link
            to={`/rfqs/${rfqId}`}
            className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Bid'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBid;
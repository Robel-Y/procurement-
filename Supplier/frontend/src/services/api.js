// src/services/api.js
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//Response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // localStorage.removeItem('token');
//       console.log(error);
//       //window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

export const rfqAPI = {
  getAll: (params = {}) => api.get('/rfqs', { params }),
  getById: (id) => api.get(`/rfqs/${id}`),
  create: (rfqData) => api.post('/rfqs', rfqData),
  update: (id, rfqData) => api.put(`/rfqs/${id}`, rfqData),
  delete: (id) => api.delete(`/rfqs/${id}`),
};

export const bidAPI = {
  getAll: (params = {}) => api.get('/bids', { params }),
  getMyBids: (params = {}) => api.get('/bids/my-bids', { params }),
  getById: (id) => api.get(`/bids/${id}`),
  getByRFQ: (rfqId) => api.get(`/bids/rfq/${rfqId}`),
  create: (bidData) => api.post('/bids', bidData),
  update: (id, bidData) => api.put(`/bids/${id}`, bidData),
  delete: (id) => api.delete(`/bids/${id}`),
  evaluate: (id, evaluationData) => api.put(`/bids/${id}/evaluate`, evaluationData),
  shortlist: (id) => api.put(`/bids/${id}/shortlist`),
  accept: (id) => api.put(`/bids/${id}/accept`),
  reject: (id, reason) => api.put(`/bids/${id}/reject`, { reason }),
};

export const supplierAPI = {
  getAll: (params = {}) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (supplierData) => api.post('/suppliers', supplierData),
  update: (id, supplierData) => api.put(`/suppliers/${id}`, supplierData),
  delete: (id) => api.delete(`/suppliers/${id}`),
  approve: (id) => api.put(`/suppliers/${id}/approve`),
  reject: (id, reason) => api.put(`/suppliers/${id}/reject`, { reason }),
  suspend: (id) => api.put(`/suppliers/${id}/suspend`),
  rate: (id, rating) => api.post(`/suppliers/${id}/rate`, { rating }),
  getStats: (id) => api.get(`/suppliers/${id}/stats`),
  syncToExternal: (id) => api.post(`/suppliers/${id}/sync`),
  syncAllToExternal: () => api.post('/suppliers/sync-all'),
};

export const catalogAPI = {
  getAll: (params = {}) => api.get('/catalog', { params }),
  getById: (id) => api.get(`/catalog/${id}`),
  create: (itemData) => api.post('/catalog', itemData),
  update: (id, itemData) => api.put(`/catalog/${id}`, itemData),
  delete: (id) => api.delete(`/catalog/${id}`),
};

// React Query hooks

// RFQ Hooks
export const useRFQs = (params = {}) => {
  return useQuery(
    ['rfqs', params],
    () => rfqAPI.getAll(params).then(res => res.data),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useRFQ = (id) => {
  return useQuery(
    ['rfq', id],
    () => rfqAPI.getById(id).then(res => res.data),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    }
  );
};

export const useCreateRFQ = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (rfqData) => rfqAPI.create(rfqData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('rfqs');
      },
    }
  );
};

export const useUpdateRFQ = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }) => rfqAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('rfqs');
      },
    }
  );
};

export const useDeleteRFQ = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (id) => rfqAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('rfqs');
      },
    }
  );
};

// Bid Hooks
export const useBids = (params = {}) => {
  return useQuery(
    ['bids', params],
    () => bidAPI.getAll(params).then(res => res.data),
    { 
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
};

export const useMyBids = (params = {}) => {
  return useQuery(
    ['my-bids', params],
    () => bidAPI.getMyBids(params).then(res => res.data),
    { 
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
    }
  );
};

export const useBid = (id) => {
  return useQuery(
    ['bid', id],
    () => bidAPI.getById(id).then(res => res.data),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
    }
  );
};

export const useBidsByRFQ = (rfqId) => {
  return useQuery(
    ['bids', 'rfq', rfqId],
    () => bidAPI.getByRFQ(rfqId).then(res => res.data),
    {
      enabled: !!rfqId,
      staleTime: 2 * 60 * 1000,
    }
  );
};

export const useCreateBid = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (bidData) => bidAPI.create(bidData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bids');
        queryClient.invalidateQueries('my-bids');
        queryClient.invalidateQueries('rfqs');
      },
    }
  );
};

export const useUpdateBid = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }) => bidAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bids');
        queryClient.invalidateQueries('my-bids');
      },
    }
  );
};

export const useDeleteBid = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (id) => bidAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bids');
        queryClient.invalidateQueries('my-bids');
        queryClient.invalidateQueries('rfqs');
      },
    }
  );
};

export const useEvaluateBid = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, evaluationData }) => bidAPI.evaluate(id, evaluationData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bids');
        queryClient.invalidateQueries('my-bids');
      },
    }
  );
};

export const useShortlistBid = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (id) => bidAPI.shortlist(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bids');
        queryClient.invalidateQueries('my-bids');
      },
    }
  );
};

export const useAcceptBid = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (id) => bidAPI.accept(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bids');
        queryClient.invalidateQueries('my-bids');
        queryClient.invalidateQueries('rfqs');
      },
    }
  );
};

export const useRejectBid = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, reason }) => bidAPI.reject(id, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bids');
        queryClient.invalidateQueries('my-bids');
      },
    }
  );
};

// Supplier Hooks
export const useSuppliers = (params = {}) => {
  return useQuery(
    ['suppliers', params],
    () => supplierAPI.getAll(params).then(res => res.data),
    { 
      keepPreviousData: true,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

export const useSupplier = (id) => {
  return useQuery(
    ['supplier', id],
    () => supplierAPI.getById(id).then(res => res.data),
    {
      enabled: !!id,
      staleTime: 10 * 60 * 1000,
    }
  );
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (supplierData) => supplierAPI.create(supplierData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('suppliers');
      },
    }
  );
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }) => supplierAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('suppliers');
        queryClient.invalidateQueries(['supplier', id]);
      },
    }
  );
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (id) => supplierAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('suppliers');
      },
    }
  );
};

export const useApproveSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (id) => supplierAPI.approve(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('suppliers');
      },
    }
  );
};

export const useRejectSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, reason }) => supplierAPI.reject(id, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('suppliers');
      },
    }
  );
};

export const useSuspendSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (id) => supplierAPI.suspend(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('suppliers');
      },
    }
  );
};

export const useRateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, rating }) => supplierAPI.rate(id, rating),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('suppliers');
      },
    }
  );
};

export const useSupplierStats = (id) => {
  return useQuery(
    ['supplier-stats', id],
    () => supplierAPI.getStats(id).then(res => res.data),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    }
  );
};

// Catalog Hooks
export const useCatalog = (params = {}) => {
  return useQuery(
    ['catalog', params],
    () => catalogAPI.getAll(params).then(res => res.data),
    { 
      keepPreviousData: true,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

export const useCatalogItem = (id) => {
  return useQuery(
    ['catalog-item', id],
    () => catalogAPI.getById(id).then(res => res.data),
    {
      enabled: !!id,
      staleTime: 10 * 60 * 1000,
    }
  );
};

export const useCreateCatalogItem = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (itemData) => catalogAPI.create(itemData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('catalog');
      },
    }
  );
};

export const useUpdateCatalogItem = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }) => catalogAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('catalog');
        queryClient.invalidateQueries(['catalog-item', id]);
      },
    }
  );
};

export const useDeleteCatalogItem = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (id) => catalogAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('catalog');
      },
    }
  );
};

// Auth Hooks
export const useLogin = () => {
  return useMutation(
    (credentials) => authAPI.login(credentials)
  );
};

export const useRegister = () => {
  return useMutation(
    (userData) => authAPI.register(userData)
  );
};

export const useUpdateProfile = () => {
  return useMutation(
    (profileData) => authAPI.updateProfile(profileData)
  );
};

export const useChangePassword = () => {
  return useMutation(
    (passwordData) => authAPI.changePassword(passwordData)
  );
};

export default api;
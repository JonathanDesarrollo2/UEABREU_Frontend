import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../library/axios';
import type { Representative } from '../ManualBalance';

export const useRepresentativeSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Representative[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);

  const searchRepresentatives = async (term: string) => {
    if (!term.trim()) return;
    setIsSearching(true);
    try {
      const params: Record<string, any> = {
        search: term,
        limit: 10,
        page: 1
      };
      const response = await api.get('/private/balance/representatives', { params });
      if (response.data.result) {
        let reps = [];
        if (response.data.content?.representatives) {
          reps = response.data.content.representatives;
        } else if (Array.isArray(response.data.content)) {
          reps = response.data.content;
        } else if (response.data.content) {
          reps = [response.data.content];
        }
        setSearchResults(reps);
        if (reps.length === 0) toast.info('No se encontraron representantes');
      } else {
        toast.error(response.data.error?.[0] || 'Error al buscar representantes');
        setSearchResults([]);
      }
    } catch (error: any) {
      toast.error('Error de conexión al buscar representantes');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const loadRepresentativeDetails = async (id: string) => {
    try {
      const response = await api.get(`/private/balance/representative/${id}/balance`);
      if (response.data.result) {
        const repData = response.data.content?.representative || response.data.content;
        setSelectedRep(repData);
        toast.success('Representante seleccionado');
        return repData;
      } else {
        toast.error(response.data.error?.[0] || 'Error al cargar información');
        return null;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.[0] || 'Error al cargar información del representante');
      return null;
    }
  };

  // Búsqueda con debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchRepresentatives(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    setSearchResults,
    isSearching,
    selectedRep,
    setSelectedRep,
    loadRepresentativeDetails,
  };
};
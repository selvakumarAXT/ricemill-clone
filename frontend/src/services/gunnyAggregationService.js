import { createAxiosInstance, createAxiosInstanceWithoutBranch } from '../utils/apiUtils';

const gunnyAggregationService = {
  // Get all gunny data from all sources
  async getAllGunnyData() {
    try {
      const [paddyData, riceData, godownData, gunnyData] = await Promise.all([
        this.getPaddyGunnyData(),
        this.getRiceGunnyData(),
        this.getGodownGunnyData(),
        this.getGunnyData()
      ]);

      const result = {
        paddyRecords: paddyData,
        riceRecords: riceData,
        godownRecords: godownData,
        gunnyRecords: gunnyData,
        summary: this.calculateSummary(paddyData, riceData, godownData, gunnyData)
      };

      return result;
    } catch (error) {
      console.error('Error fetching all gunny data:', error);
      throw error;
    }
  },

  // Get gunny data from Paddy Management
  async getPaddyGunnyData() {
    try {
      const api = createAxiosInstanceWithoutBranch();
      const response = await api.get('/paddy');
      
      // Check if response.data has a 'data' property (pagination structure)
      const paddyRecords = response.data.data || response.data;
      
      const mappedData = paddyRecords.map(paddy => ({
        ...paddy,
        source: 'Paddy Management',
        recordType: 'paddy',
        date: paddy.issueDate || paddy.createdAt,
        displayDate: paddy.issueDate ? new Date(paddy.issueDate).toLocaleDateString() : new Date(paddy.createdAt).toLocaleDateString(),
        branch: paddy.branch_id || { name: paddy.branch_id }
      }));
      
      return mappedData;
    } catch (error) {
      console.error('Error fetching paddy gunny data:', error);
      return [];
    }
  },

  // Get gunny data from Rice Management
  async getRiceGunnyData() {
    try {
      const api = createAxiosInstanceWithoutBranch();
      const response = await api.get('/rice-deposits');
      const riceRecords = response.data.data || response.data;
      return riceRecords.map(rice => ({
        ...rice,
        source: 'Rice Management',
        recordType: 'rice',
        date: rice.date || rice.month,
        displayDate: rice.date ? new Date(rice.date).toLocaleDateString() : rice.month,
        gunny: {
          nb: 0,
          onb: rice.gunnyBags?.onb || rice.gunny?.onb || 0,
          ss: rice.gunnyBags?.ss || rice.gunny?.ss || 0,
          swp: 0
        },
        branch: rice.branch_id || { name: rice.branch_id }
      }));
    } catch (error) {
      console.error('Error fetching rice gunny data:', error);
      return [];
    }
  },

  // Get gunny data from Godown Management
  async getGodownGunnyData() {
    try {
      const api = createAxiosInstanceWithoutBranch();
      const response = await api.get('/godown-deposits');
      const godownRecords = response.data.data || response.data;
      return godownRecords.map(godown => ({
        ...godown,
        source: 'Godown Management',
        recordType: 'godown',
        date: godown.date,
        displayDate: new Date(godown.date).toLocaleDateString(),
        gunny: {
          nb: 0,
          onb: godown.gunny?.onb || 0,
          ss: godown.gunny?.ss || 0,
          swp: 0
        },
        branch: godown.branch_id || { name: godown.branch_id }
      }));
    } catch (error) {
      console.error('Error fetching godown gunny data:', error);
      return [];
    }
  },

  // Get gunny data from Gunny Management
  async getGunnyData() {
    try {
      const api = createAxiosInstanceWithoutBranch();
      const response = await api.get('/gunny');
      const gunnyRecords = response.data.data || response.data;
      return gunnyRecords.map(gunny => ({
        ...gunny,
        source: 'Gunny Management',
        recordType: 'gunny',
        date: gunny.issueDate || gunny.createdAt,
        displayDate: gunny.issueDate ? new Date(gunny.issueDate).toLocaleDateString() : new Date(gunny.createdAt).toLocaleDateString(),
        branch: gunny.branch_id || { name: gunny.branch_id }
      }));
    } catch (error) {
      console.error('Error fetching gunny data:', error);
      return [];
    }
  },

  // Calculate summary statistics
  calculateSummary(paddyData, riceData, godownData, gunnyData) {
    const allRecords = [...paddyData, ...riceData, ...godownData, ...gunnyData];
    
    const summary = {
      totalRecords: allRecords.length,
      totalNB: 0,
      totalONB: 0,
      totalSS: 0,
      totalSWP: 0,
      totalBags: 0,
      totalWeight: 0,
      bySource: {
        paddy: { count: paddyData.length, nb: 0, onb: 0, ss: 0, swp: 0, bags: 0, weight: 0 },
        rice: { count: riceData.length, nb: 0, onb: 0, ss: 0, swp: 0, bags: 0, weight: 0 },
        godown: { count: godownData.length, nb: 0, onb: 0, ss: 0, swp: 0, bags: 0, weight: 0 },
        gunny: { count: gunnyData.length, nb: 0, onb: 0, ss: 0, swp: 0, bags: 0, weight: 0 }
      }
    };

    // Calculate totals
    allRecords.forEach(record => {
      const gunny = record.gunny || {};
      const paddy = record.paddy || {};
      
      summary.totalNB += gunny.nb || 0;
      summary.totalONB += gunny.onb || 0;
      summary.totalSS += gunny.ss || 0;
      summary.totalSWP += gunny.swp || 0;
      summary.totalBags += paddy.bags || 0;
      summary.totalWeight += paddy.weight || 0;

      // Calculate by source
      const sourceKey = record.recordType;
      if (summary.bySource[sourceKey]) {
        summary.bySource[sourceKey].nb += gunny.nb || 0;
        summary.bySource[sourceKey].onb += gunny.onb || 0;
        summary.bySource[sourceKey].ss += gunny.ss || 0;
        summary.bySource[sourceKey].swp += gunny.swp || 0;
        summary.bySource[sourceKey].bags += paddy.bags || 0;
        summary.bySource[sourceKey].weight += paddy.weight || 0;
      }
    });

    return summary;
  },

  // Get aggregated gunny stats
  async getAggregatedStats() {
    try {
      const data = await this.getAllGunnyData();
      return data.summary;
    } catch (error) {
      console.error('Error fetching aggregated stats:', error);
      throw error;
    }
  }
};

export default gunnyAggregationService; 
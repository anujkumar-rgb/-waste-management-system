/**
 * Smart Waste Management System - Supabase Backend & Realtime Integration Service
 * Provides PostgreSQL Database Queries, Row Level Security, and Realtime Subscriptions.
 */

(function (window) {
  'use strict';

  const SupabaseBackend = {
    realtimeChannel: null,
    listeners: {
      reports: [],
      fleet: [],
      broadcasts: [],
      redemptions: []
    },

    /**
     * Check if Supabase client credentials are configured
     */
    isConfigured: function () {
      const url = localStorage.getItem('swm_supabase_url') || window.SUPABASE_URL;
      const key = localStorage.getItem('swm_supabase_anon_key') || window.SUPABASE_ANON_KEY;
      return Boolean(url && key && window.supabase);
    },

    /**
     * Obtain active Supabase client instance
     */
    getClient: function () {
      if (typeof window.initSupabaseClient === 'function') {
        return window.initSupabaseClient();
      }
      const url = localStorage.getItem('swm_supabase_url') || window.SUPABASE_URL;
      const key = localStorage.getItem('swm_supabase_anon_key') || window.SUPABASE_ANON_KEY;
      if (url && key && window.supabase) {
        if (!window.supabaseClient) {
          window.supabaseClient = window.supabase.createClient(url, key, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
          });
        }
        return window.supabaseClient;
      }
      return null;
    },

    /**
     * Test connection to Supabase PostgreSQL database
     */
    testConnection: async function () {
      const client = this.getClient();
      if (!client) return { ok: false, message: 'Supabase credentials not configured' };
      try {
        const { data, error } = await client.from('compliance_metrics').select('ward').limit(1);
        if (error) throw error;
        return { ok: true, message: 'Connected to Supabase PostgreSQL database successfully!' };
      } catch (err) {
        return { ok: false, message: err.message || 'Failed to query Supabase database' };
      }
    },

    // ------------------------------------------------------------------------
    // REPORTS CRUD
    // ------------------------------------------------------------------------
    fetchReports: async function () {
      const client = this.getClient();
      if (!client) return null;
      try {
        const { data, error } = await client.from('reports').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        // Map database columns to app schema
        return (data || []).map(r => ({
          id: r.id,
          userId: r.user_id,
          userName: r.user_name,
          userRole: r.user_role,
          area: r.area,
          coords: { lat: r.latitude, lng: r.longitude },
          latitude: r.latitude,
          longitude: r.longitude,
          landmark: r.landmark,
          resolvedAddress: r.resolved_address,
          category: r.category,
          severity: r.severity,
          notes: r.notes,
          photoUrl: r.photo_url,
          voiceUrl: r.voice_url,
          isEmergency: r.is_emergency,
          isPriorityPickup: r.is_priority_pickup,
          status: r.status,
          assignedWorkerId: r.assigned_worker_id,
          assignedWorkerName: r.assigned_worker_name,
          duplicateCount: r.duplicate_count || 0,
          isEscalated: r.is_escalated,
          volumeKg: r.volume_kg,
          containerCount: r.container_count,
          isBulk: r.is_bulk,
          clearedAt: r.cleared_at ? new Date(r.cleared_at).getTime() : null,
          assignedAt: r.assigned_at ? new Date(r.assigned_at).getTime() : null,
          resolutionNotes: r.resolution_notes,
          createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now()
        }));
      } catch (err) {
        console.warn('Supabase fetchReports notice:', err.message);
        return null;
      }
    },

    insertReport: async function (report) {
      const client = this.getClient();
      if (!client) return false;
      try {
        const row = {
          id: report.id,
          user_id: report.userId || (window.currentUser ? window.currentUser.id : 'usr-anon'),
          user_name: report.userName || (window.currentUser ? window.currentUser.name : 'Citizen'),
          user_role: report.userRole || 'citizen',
          area: report.area,
          latitude: report.latitude || report.coords?.lat || 19.0760,
          longitude: report.longitude || report.coords?.lng || 72.8777,
          landmark: report.landmark || '',
          resolved_address: report.resolvedAddress || '',
          category: report.category,
          severity: report.severity || 'medium',
          notes: report.notes || '',
          photo_url: report.photoUrl || '',
          voice_url: report.voiceUrl || '',
          is_emergency: Boolean(report.isEmergency),
          is_priority_pickup: Boolean(report.isPriorityPickup),
          status: report.status || 'reported',
          assigned_worker_id: report.assignedWorkerId || null,
          assigned_worker_name: report.assignedWorkerName || null,
          duplicate_count: report.duplicateCount || 0,
          is_escalated: Boolean(report.isEscalated),
          volume_kg: report.volumeKg || 0,
          container_count: report.containerCount || 1,
          is_bulk: Boolean(report.isBulk)
        };
        const { error } = await client.from('reports').insert(row);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Supabase insertReport notice:', err.message);
        return false;
      }
    },

    updateReport: async function (id, updates) {
      const client = this.getClient();
      if (!client) return false;
      try {
        const mapped = {};
        if (updates.status !== undefined) mapped.status = updates.status;
        if (updates.assignedWorkerId !== undefined) mapped.assigned_worker_id = updates.assignedWorkerId;
        if (updates.assignedWorkerName !== undefined) mapped.assigned_worker_name = updates.assignedWorkerName;
        if (updates.duplicateCount !== undefined) mapped.duplicate_count = updates.duplicateCount;
        if (updates.isEscalated !== undefined) mapped.is_escalated = updates.isEscalated;
        if (updates.resolutionNotes !== undefined) mapped.resolution_notes = updates.resolutionNotes;
        if (updates.clearedAt !== undefined) mapped.cleared_at = new Date(updates.clearedAt).toISOString();
        if (updates.assignedAt !== undefined) mapped.assigned_at = new Date(updates.assignedAt).toISOString();

        const { error } = await client.from('reports').update(mapped).eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Supabase updateReport notice:', err.message);
        return false;
      }
    },

    // ------------------------------------------------------------------------
    // FLEET & WORKER TELEMETRY
    // ------------------------------------------------------------------------
    fetchFleet: async function () {
      const client = this.getClient();
      if (!client) return null;
      try {
        const { data, error } = await client.from('fleet').select('*');
        if (error) throw error;
        return (data || []).map(f => ({
          id: f.id,
          type: f.type,
          regNo: f.reg_no,
          ward: f.ward,
          driver: f.driver,
          driverId: f.driver_id,
          contact: f.contact,
          capacityTon: f.capacity_ton,
          currentPayloadTon: f.current_payload_ton,
          fuelPercent: f.fuel_percent,
          status: f.status,
          icon: f.icon,
          lastKnownLat: f.last_known_lat,
          lastKnownLng: f.last_known_lng,
          lastLocationUpdatedAt: f.last_location_updated_at ? new Date(f.last_location_updated_at).getTime() : Date.now()
        }));
      } catch (err) {
        console.warn('Supabase fetchFleet notice:', err.message);
        return null;
      }
    },

    updateWorkerLocation: async function (driverId, lat, lng) {
      const client = this.getClient();
      if (!client) return false;
      try {
        const { error } = await client
          .from('fleet')
          .update({
            last_known_lat: lat,
            last_known_lng: lng,
            last_location_updated_at: new Date().toISOString()
          })
          .eq('driver_id', driverId);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Supabase updateWorkerLocation notice:', err.message);
        return false;
      }
    },

    // ------------------------------------------------------------------------
    // HOSPITAL BIOMEDICAL REPORTS
    // ------------------------------------------------------------------------
    fetchHospitalReports: async function () {
      const client = this.getClient();
      if (!client) return null;
      try {
        const { data, error } = await client.from('hospital_reports').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(h => ({
          id: h.id,
          userId: h.user_id,
          userName: h.user_name,
          registrationNo: h.registration_no,
          category: h.category,
          categoryName: h.category_name,
          hospitalWard: h.hospital_ward,
          containerCode: h.container_code,
          volumeKg: h.volume_kg,
          lifecycleStage: h.lifecycle_stage,
          treatmentFacility: h.treatment_facility,
          status: h.status,
          createdAt: h.created_at ? new Date(h.created_at).getTime() : Date.now()
        }));
      } catch (err) {
        console.warn('Supabase fetchHospitalReports notice:', err.message);
        return null;
      }
    },

    insertHospitalReport: async function (report) {
      const client = this.getClient();
      if (!client) return false;
      try {
        const row = {
          id: report.id,
          user_id: report.userId,
          user_name: report.userName,
          registration_no: report.registrationNo,
          category: report.category,
          category_name: report.categoryName,
          hospital_ward: report.hospitalWard,
          container_code: report.containerCode,
          volume_kg: report.volumeKg,
          lifecycle_stage: report.lifecycleStage || 'At Facility',
          treatment_facility: report.treatmentFacility,
          status: report.status || 'assigned'
        };
        const { error } = await client.from('hospital_reports').insert(row);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Supabase insertHospitalReport notice:', err.message);
        return false;
      }
    },

    // ------------------------------------------------------------------------
    // BROADCASTS & ALERTS
    // ------------------------------------------------------------------------
    fetchBroadcasts: async function () {
      const client = this.getClient();
      if (!client) return null;
      try {
        const { data, error } = await client.from('broadcasts').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(b => ({
          id: b.id,
          message: b.message,
          level: b.level,
          author: b.author,
          timestamp: b.created_at ? new Date(b.created_at).getTime() : Date.now(),
          active: b.active
        }));
      } catch (err) {
        console.warn('Supabase fetchBroadcasts notice:', err.message);
        return null;
      }
    },

    insertBroadcast: async function (bc) {
      const client = this.getClient();
      if (!client) return false;
      try {
        const row = {
          id: bc.id,
          message: bc.message,
          level: bc.level || 'info',
          author: bc.author || 'Municipal Officer',
          active: bc.active !== undefined ? bc.active : true
        };
        const { error } = await client.from('broadcasts').insert(row);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Supabase insertBroadcast notice:', err.message);
        return false;
      }
    },

    // ------------------------------------------------------------------------
    // REALTIME SUBSCRIPTIONS (WebSocket updates from PostgreSQL)
    // ------------------------------------------------------------------------
    initRealtime: function (callbacks = {}) {
      const client = this.getClient();
      if (!client || typeof client.channel !== 'function') return null;

      if (this.realtimeChannel) {
        client.removeChannel(this.realtimeChannel);
      }

      console.log('⚡ Initializing Supabase PostgreSQL Realtime subscriptions...');
      const channel = client.channel('public:waste-mgmt-realtime');

      // Listen for reports INSERT/UPDATE/DELETE
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, payload => {
        console.log('⚡ Realtime reports event:', payload.eventType, payload.new);
        if (typeof callbacks.onReportChange === 'function') {
          callbacks.onReportChange(payload);
        }
        window.dispatchEvent(new CustomEvent('supabase:report-change', { detail: payload }));
      });

      // Listen for fleet telemetry updates
      channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'fleet' }, payload => {
        if (typeof callbacks.onFleetChange === 'function') {
          callbacks.onFleetChange(payload);
        }
        window.dispatchEvent(new CustomEvent('supabase:fleet-change', { detail: payload }));
      });

      // Listen for new broadcasts
      channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'broadcasts' }, payload => {
        if (typeof callbacks.onBroadcastChange === 'function') {
          callbacks.onBroadcastChange(payload);
        }
        window.dispatchEvent(new CustomEvent('supabase:broadcast-new', { detail: payload }));
      });

      // Listen for redemptions status changes
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'redemptions' }, payload => {
        if (typeof callbacks.onRedemptionChange === 'function') {
          callbacks.onRedemptionChange(payload);
        }
        window.dispatchEvent(new CustomEvent('supabase:redemption-change', { detail: payload }));
      });

      channel.subscribe((status) => {
        console.log('⚡ Supabase Realtime channel status:', status);
        const indicator = document.getElementById('supabaseRealtimeIndicator');
        if (indicator) {
          if (status === 'SUBSCRIBED') {
            indicator.textContent = '🟢 Realtime PostgreSQL Connected';
            indicator.style.color = '#10b981';
          } else {
            indicator.textContent = '⚪ Realtime: ' + status;
            indicator.style.color = '#94a3b8';
          }
        }
      });

      this.realtimeChannel = channel;
      return channel;
    }
  };

  window.SupabaseBackend = SupabaseBackend;
})(window);

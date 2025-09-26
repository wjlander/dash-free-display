import { HomeAssistantEntity, HomeAssistantService, HomeAssistantWebSocketMessage } from '@/types/homeassistant';

export class HomeAssistantAPI {
  private baseUrl: string;
  private accessToken: string;
  private websocket: WebSocket | null = null;
  private messageId = 1;
  private subscriptions = new Map<string, (entity: HomeAssistantEntity) => void>();

  constructor(baseUrl: string, accessToken: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.accessToken = accessToken;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Home Assistant API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/');
      return true;
    } catch (error) {
      console.error('Home Assistant connection test failed:', error);
      return false;
    }
  }

  async getStates(): Promise<HomeAssistantEntity[]> {
    return this.makeRequest('/states');
  }

  async getState(entityId: string): Promise<HomeAssistantEntity> {
    return this.makeRequest(`/states/${entityId}`);
  }

  async callService(service: HomeAssistantService): Promise<any> {
    return this.makeRequest(`/services/${service.domain}/${service.service}`, {
      method: 'POST',
      body: JSON.stringify({
        ...service.service_data,
        ...service.target,
      }),
    });
  }

  async getServices(): Promise<Record<string, any>> {
    return this.makeRequest('/services');
  }

  async getConfig(): Promise<any> {
    return this.makeRequest('/config');
  }

  // WebSocket connection for real-time updates
  connectWebSocket(onEntityUpdate?: (entity: HomeAssistantEntity) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.baseUrl.replace(/^http/, 'ws') + '/api/websocket';
      
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        // Send auth message
        this.websocket?.send(JSON.stringify({
          type: 'auth',
          access_token: this.accessToken
        }));
      };

      this.websocket.onmessage = (event) => {
        const message: HomeAssistantWebSocketMessage = JSON.parse(event.data);
        
        if (message.type === 'auth_ok') {
          // Subscribe to state changes
          this.websocket?.send(JSON.stringify({
            id: this.messageId++,
            type: 'subscribe_events',
            event_type: 'state_changed'
          }));
          resolve();
        } else if (message.type === 'auth_invalid') {
          reject(new Error('Invalid Home Assistant access token'));
        } else if (message.type === 'event' && message.event?.event_type === 'state_changed') {
          const entityId = message.event.data.entity_id;
          const newState = message.event.data.new_state;
          
          // Call registered callbacks
          this.subscriptions.forEach((callback) => {
            callback(newState);
          });
          
          if (onEntityUpdate) {
            onEntityUpdate(newState);
          }
        }
      };

      this.websocket.onerror = (error) => {
        reject(error);
      };

      this.websocket.onclose = () => {
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (this.websocket?.readyState === WebSocket.CLOSED) {
            this.connectWebSocket(onEntityUpdate);
          }
        }, 5000);
      };
    });
  }

  subscribeToEntity(entityId: string, callback: (entity: HomeAssistantEntity) => void) {
    this.subscriptions.set(entityId, callback);
  }

  unsubscribeFromEntity(entityId: string) {
    this.subscriptions.delete(entityId);
  }

  disconnectWebSocket() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.subscriptions.clear();
  }

  // Helper methods for common entity types
  async toggleLight(entityId: string): Promise<void> {
    await this.callService({
      domain: 'light',
      service: 'toggle',
      target: { entity_id: entityId }
    });
  }

  async setLightBrightness(entityId: string, brightness: number): Promise<void> {
    await this.callService({
      domain: 'light',
      service: 'turn_on',
      target: { entity_id: entityId },
      service_data: { brightness }
    });
  }

  async toggleSwitch(entityId: string): Promise<void> {
    await this.callService({
      domain: 'switch',
      service: 'toggle',
      target: { entity_id: entityId }
    });
  }

  async setClimateTemperature(entityId: string, temperature: number): Promise<void> {
    await this.callService({
      domain: 'climate',
      service: 'set_temperature',
      target: { entity_id: entityId },
      service_data: { temperature }
    });
  }
}

// Utility functions
export const getEntityDomain = (entityId: string): string => {
  return entityId.split('.')[0];
};

export const getEntityIcon = (entity: HomeAssistantEntity): string => {
  if (entity.attributes.icon) {
    return entity.attributes.icon;
  }

  const domain = getEntityDomain(entity.entity_id);
  
  // Default icons based on domain
  const domainIcons: Record<string, string> = {
    light: 'mdi:lightbulb',
    switch: 'mdi:toggle-switch',
    sensor: 'mdi:gauge',
    binary_sensor: 'mdi:checkbox-marked-circle',
    climate: 'mdi:thermostat',
    cover: 'mdi:window-shutter',
    media_player: 'mdi:speaker',
    camera: 'mdi:camera',
    lock: 'mdi:lock',
    alarm_control_panel: 'mdi:shield-home',
    fan: 'mdi:fan',
    vacuum: 'mdi:robot-vacuum'
  };

  return domainIcons[domain] || 'mdi:help-circle';
};

export const formatEntityState = (entity: HomeAssistantEntity): string => {
  const domain = getEntityDomain(entity.entity_id);
  
  if (entity.attributes.unit_of_measurement) {
    return `${entity.state} ${entity.attributes.unit_of_measurement}`;
  }
  
  if (domain === 'binary_sensor' || domain === 'switch' || domain === 'light') {
    return entity.state === 'on' ? 'On' : 'Off';
  }
  
  if (domain === 'climate') {
    return `${entity.state} (${entity.attributes.current_temperature}°)`;
  }
  
  return entity.state;
};

export const isControllableEntity = (entity: HomeAssistantEntity): boolean => {
  const domain = getEntityDomain(entity.entity_id);
  const controllableDomains = ['light', 'switch', 'climate', 'cover', 'media_player', 'fan', 'lock'];
  return controllableDomains.includes(domain);
};
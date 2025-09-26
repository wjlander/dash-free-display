export interface HomeAssistantEntity {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    icon?: string;
    unit_of_measurement?: string;
    device_class?: string;
    [key: string]: any;
  };
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id?: string;
    user_id?: string;
  };
}

export interface HomeAssistantConfig {
  id: string;
  user_id: string;
  ha_url: string;
  access_token: string;
  connection_type: 'local' | 'cloud';
  is_connected: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

export interface HomeAssistantWidgetItem {
  id: string;
  user_id: string;
  entity_id: string;
  display_name: string;
  widget_type: 'toggle' | 'sensor' | 'climate' | 'light' | 'cover' | 'media_player';
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: {
    show_icon: boolean;
    show_state: boolean;
    show_attributes: string[];
    color_theme?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface HomeAssistantService {
  domain: string;
  service: string;
  service_data?: Record<string, any>;
  target?: {
    entity_id: string | string[];
  };
}

export interface HomeAssistantWebSocketMessage {
  id?: number;
  type: string;
  event?: {
    event_type: string;
    data: {
      entity_id: string;
      new_state: HomeAssistantEntity;
      old_state: HomeAssistantEntity;
    };
  };
  result?: HomeAssistantEntity[];
  success?: boolean;
  error?: {
    code: string;
    message: string;
  };
}
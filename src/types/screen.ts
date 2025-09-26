export interface DashboardScreen {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  layout_data: WidgetLayoutItem[];
  is_public: boolean;
  public_token?: string;
  created_at: string;
  updated_at: string;
}

export interface WidgetLayoutItem {
  id: string;
  type: string;
  props: any;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface ScreenSettings {
  background_image?: string;
  theme_variant?: string;
  auto_refresh?: boolean;
  refresh_interval?: number;
}
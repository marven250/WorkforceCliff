export interface Provider {
  id: number;
  name: string;
  integration_type: string;
  is_enabled: boolean;
  redirect_url: string;
  status: string
}

export interface User {
  id: number;
  name: string;
}

export type GamePlatformResponse = {
  platform: string | number;
  title: string;
  description?: string;
  cover_image?: string;
  status?: string;
};

export type PlatformResponse = {
  platform_id: string | number;
  name: string;
  type?: string;
  icon_url?: string;
};

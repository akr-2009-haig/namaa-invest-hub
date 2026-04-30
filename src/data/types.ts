// أنواع البيانات المخزنة في GitHub JSON

export interface UserRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dial_code: string;
  country_code: string;
  country_name: string;
  password_hash: string; // SHA-256 hex (تنبيه: ليس آمناً للإنتاج)
  created_at: string;
  is_admin?: boolean;
  is_root_admin?: boolean;
  admin_permissions?: AdminPermissions;
}

export interface AdminPermissions {
  // أقسام الموقع للمستخدم
  view_user_sections: boolean;
  // لوحة التحكم
  manage_dashboard: boolean;
  manage_admins: boolean;
  manage_home: boolean;
  manage_features: boolean;
  manage_plans: boolean;
  manage_faq: boolean;
  manage_contact: boolean;
  manage_social_links: boolean;
  manage_site_name: boolean;
  manage_colors: boolean;
  manage_preview: boolean;
  manage_wallets: boolean;
}

export const FULL_PERMISSIONS: AdminPermissions = {
  view_user_sections: true,
  manage_dashboard: true,
  manage_admins: true,
  manage_home: true,
  manage_features: true,
  manage_plans: true,
  manage_faq: true,
  manage_contact: true,
  manage_social_links: true,
  manage_site_name: true,
  manage_colors: true,
  manage_preview: true,
  manage_wallets: true,
};

export const EMPTY_PERMISSIONS: AdminPermissions = {
  view_user_sections: true,
  manage_dashboard: false,
  manage_admins: false,
  manage_home: false,
  manage_features: false,
  manage_plans: false,
  manage_faq: false,
  manage_contact: false,
  manage_social_links: false,
  manage_site_name: false,
  manage_colors: false,
  manage_preview: false,
  manage_wallets: false,
};

export interface WalletRecord {
  user_id: string;
  // الحقول التي يفعّلها الآدمن
  fields: {
    name?: string;
    email?: string;
    investment_amount?: string;
    profits?: string;
    fees?: string;
    iban?: string;
    digital_wallet?: string;
    system_account?: string;
    system_wallet?: string;
  };
  // أي حقل يظهر للمستخدم؟
  visible: {
    name?: boolean;
    email?: boolean;
    investment_amount?: boolean;
    profits?: boolean;
    fees?: boolean;
    iban?: boolean;
    digital_wallet?: boolean;
    system_account?: boolean;
    system_wallet?: boolean;
  };
  updated_at: string;
}

export interface PlanItem {
  amount: string;
  daily_return: string;
}

export interface PlanGroup {
  currency: string;
  symbol: string;
  flag: string;
  items: PlanItem[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface SiteContent {
  site_name: string;
  hero_title: string;
  hero_subtitle: string;
  about: string;
  features: FeatureItem[];
  plans: PlanGroup[];
  steps: { title: string; description: string }[];
  faqs: FaqItem[];
  contact: {
    email: string;
    phone: string;
    address: string;
    description: string;
  };
  social_links: {
    telegram?: string;
    whatsapp?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  payment_link: string; // رابط تيليجرام للدعم/الإيداع
  theme: {
    primary_hsl: string;
    gold_hsl: string;
    background_hsl: string;
  };
}

export interface SiteConfig {
  proxy_url?: string; // إذا تم ضبطه، يستخدم Vercel Proxy بدل localStorage
}

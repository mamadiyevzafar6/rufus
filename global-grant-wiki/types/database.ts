/**
 * Типы базы Supabase, генерируются CLI:
 *   supabase gen types typescript --project-id YOUR_ID > types/database.ts
 * Ниже — ручная версия, синхронная с supabase/migrations/0001_init.sql.
 */

import type {
  FundingType,
  OpportunityStatus,
  OpportunityType,
} from '@/types';

export interface OpportunitiesRow {
  id: string;
  title: string;
  type: OpportunityType;
  organization: string;
  logo_url: string;
  location: string;
  funding_type: FundingType;
  deadline: string;
  tags: string[];
  description: string;
  application_link: string;
  status: OpportunityStatus;
  created_at: string;
  updated_at: string;
}

export type OpportunitiesInsert = Omit<
  OpportunitiesRow,
  'id' | 'created_at' | 'updated_at'
>;

export type OpportunitiesUpdate = Partial<OpportunitiesInsert>;

export interface Database {
  public: {
    Tables: {
      opportunities: {
        Row: OpportunitiesRow;
        Insert: OpportunitiesInsert;
        Update: OpportunitiesUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      opportunity_type: OpportunityType;
      funding_type: FundingType;
      opportunity_status: OpportunityStatus;
    };
  };
}

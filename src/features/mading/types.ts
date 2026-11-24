export type ClassSectionId = "A" | "B";

export interface MadingClassSource {
  spreadsheetId: string;
  gid: string;
}

export interface MadingFeedConfig {
  id: string;
  index: string;
  tag: string;
  titleFirst: string;
  titleSecond: string;
  subtitle: string;
  isHot?: boolean;
  defaultClass: ClassSectionId;
  classes: Record<ClassSectionId, MadingClassSource | null>;
}

export interface GroupMember {
  nama: string;
  peran: string;
  isLeader: boolean;
}

export interface QuestionnaireGroup {
  id: string;
  kelompok: string;
  order: number;
  topik: string | null;
  topikFromForm?: boolean;
  formDescription?: string | null;
  estimatedTime?: string | null;
  requiresLogin?: boolean;
  links: string[];
  primaryLink: string | null;
  linkHost: string | null;
  members: GroupMember[];
}

export type MadingDataState =
  | { status: "loading"; sourceKey: string; groups: QuestionnaireGroup[] }
  | {
      status: "ready";
      sourceKey: string;
      groups: QuestionnaireGroup[];
      fetchedAt: number;
    }
  | {
      status: "error";
      sourceKey: string;
      groups: QuestionnaireGroup[];
      message: string;
    };

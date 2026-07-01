import * as repo from './settings.repository';

const BANK_TRANSFER_KEY = 'bank_transfer';
const SMTP_KEY = 'smtp';

export interface BankTransferSettings {
  qrImagePath: string | null;
  accountName: string;
  accountNumber: string;
  bankName: string;
  note: string;
}

const EMPTY_BANK_TRANSFER: BankTransferSettings = {
  qrImagePath: null,
  accountName: '',
  accountNumber: '',
  bankName: '',
  note: '',
};

function normalize(raw: Partial<BankTransferSettings> | null | undefined): BankTransferSettings {
  return {
    qrImagePath: raw?.qrImagePath ?? null,
    accountName: raw?.accountName ?? '',
    accountNumber: raw?.accountNumber ?? '',
    bankName: raw?.bankName ?? '',
    note: raw?.note ?? '',
  };
}

/** Cấu hình chuyển khoản dùng cho admin (đầy đủ) và public (đã normalize). */
export async function getBankTransfer(): Promise<BankTransferSettings> {
  const row = await repo.get<Partial<BankTransferSettings>>(BANK_TRANSFER_KEY);
  return normalize(row?.value);
}

export async function updateBankTransfer(
  input: Partial<BankTransferSettings>,
  adminId: number,
): Promise<BankTransferSettings> {
  const next = normalize({ ...EMPTY_BANK_TRANSFER, ...input });
  const row = await repo.upsert<BankTransferSettings>(BANK_TRANSFER_KEY, next, adminId);
  return normalize(row.value);
}

// ─── SMTP ────────────────────────────────────────────────────────────────────

export interface SmtpSettings {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

const EMPTY_SMTP: SmtpSettings = {
  enabled: false,
  host: '',
  port: 587,
  secure: false,
  user: '',
  pass: '',
  fromName: 'Konnit',
  fromEmail: '',
};

function normalizeSmtp(raw: Partial<SmtpSettings> | null | undefined): SmtpSettings {
  return {
    enabled: raw?.enabled ?? false,
    host: raw?.host ?? '',
    port: typeof raw?.port === 'number' ? raw.port : 587,
    secure: raw?.secure ?? false,
    user: raw?.user ?? '',
    pass: raw?.pass ?? '',
    fromName: raw?.fromName ?? 'Konnit',
    fromEmail: raw?.fromEmail ?? '',
  };
}

export async function getSmtp(): Promise<SmtpSettings> {
  const row = await repo.get<Partial<SmtpSettings>>(SMTP_KEY);
  return normalizeSmtp(row?.value);
}

export async function updateSmtp(input: Partial<SmtpSettings>, adminId: number): Promise<SmtpSettings> {
  const next = normalizeSmtp({ ...EMPTY_SMTP, ...input });
  const row = await repo.upsert<SmtpSettings>(SMTP_KEY, next, adminId);
  return normalizeSmtp(row.value);
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

const LOGO_KEY = 'logo';

export interface LogoSettings {
  url: string | null;
}

export async function getLogo(): Promise<LogoSettings> {
  const row = await repo.get<{ url?: string | null }>(LOGO_KEY);
  return { url: row?.value?.url ?? null };
}

export async function updateLogo(input: Partial<LogoSettings>, adminId: number): Promise<LogoSettings> {
  const next: LogoSettings = { url: input.url ?? null };
  const row = await repo.upsert<LogoSettings>(LOGO_KEY, next, adminId);
  return { url: (row.value as LogoSettings).url ?? null };
}

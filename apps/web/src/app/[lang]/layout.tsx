import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { FALLBACK_LOCALES } from "@/lib/i18n/config";

// Prebuild các locale tĩnh đã biết; locale thêm động vẫn render nhờ dynamicParams (mặc định true).
export function generateStaticParams() {
  return FALLBACK_LOCALES.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <LocaleProvider locale={lang} dict={dict}>
      {children}
    </LocaleProvider>
  );
}

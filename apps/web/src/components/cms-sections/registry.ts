import { cmsSectionRegistry } from "@konnit/ui";

// Hero
import { HeroStyle1 } from "./HeroSection/HeroStyle1";
import { HeroStyle2 } from "./HeroSection/HeroStyle2";
import { HeroStyle3 } from "./HeroSection/HeroStyle3";
// RichText
import { RichTextStyle1 } from "./RichTextSection/RichTextStyle1";
import { RichTextStyle2 } from "./RichTextSection/RichTextStyle2";
import { RichTextStyle3 } from "./RichTextSection/RichTextStyle3";
// ImageText
import { ImageTextStyle1 } from "./ImageTextSection/ImageTextStyle1";
import { ImageTextStyle2 } from "./ImageTextSection/ImageTextStyle2";
import { ImageTextStyle3 } from "./ImageTextSection/ImageTextStyle3";
// FeatureGrid
import { FeatureGridStyle1 } from "./FeatureGridSection/FeatureGridStyle1";
import { FeatureGridStyle2 } from "./FeatureGridSection/FeatureGridStyle2";
import { FeatureGridStyle3 } from "./FeatureGridSection/FeatureGridStyle3";
// Schedule
import { ScheduleStyle1 } from "./ScheduleSection/ScheduleStyle1";
import { ScheduleStyle2 } from "./ScheduleSection/ScheduleStyle2";
import { ScheduleStyle3 } from "./ScheduleSection/ScheduleStyle3";
// FAQ
import { FAQStyle1 } from "./FAQSection/FAQStyle1";
import { FAQStyle2 } from "./FAQSection/FAQStyle2";
// CTA
import { CTAStyle1 } from "./CTASection/CTAStyle1";
import { CTAStyle2 } from "./CTASection/CTAStyle2";
import { CTAStyle3 } from "./CTASection/CTAStyle3";
// Sponsor
import { SponsorStyle1 } from "./SponsorSection/SponsorStyle1";
import { SponsorStyle2 } from "./SponsorSection/SponsorStyle2";
// NoteAlert
import { NoteAlertStyle1 } from "./NoteAlertSection/NoteAlertStyle1";
import { NoteAlertStyle2 } from "./NoteAlertSection/NoteAlertStyle2";
import { NoteAlertStyle3 } from "./NoteAlertSection/NoteAlertStyle3";
// TicketPreview
import { TicketPreviewStyle1 } from "./TicketPreviewSection/TicketPreviewStyle1";
import { TicketPreviewStyle2 } from "./TicketPreviewSection/TicketPreviewStyle2";

cmsSectionRegistry["hero"] = {
  label: "Hero",
  fields: ["title", "description", "content", "note", "image", "primaryCta", "secondaryCta"],
  styles: { style_1: HeroStyle1, style_2: HeroStyle2, style_3: HeroStyle3 },
};

cmsSectionRegistry["rich_text"] = {
  label: "Nội dung văn bản",
  fields: ["title", "description", "content", "note"],
  styles: { style_1: RichTextStyle1, style_2: RichTextStyle2, style_3: RichTextStyle3 },
};

cmsSectionRegistry["image_text"] = {
  label: "Ảnh + Văn bản",
  fields: ["title", "description", "content", "note", "image", "imagePosition"],
  styles: { style_1: ImageTextStyle1, style_2: ImageTextStyle2, style_3: ImageTextStyle3 },
};

cmsSectionRegistry["feature_grid"] = {
  label: "Feature Grid",
  fields: ["title", "description", "items"],
  styles: { style_1: FeatureGridStyle1, style_2: FeatureGridStyle2, style_3: FeatureGridStyle3 },
};

cmsSectionRegistry["schedule"] = {
  label: "Lịch trình",
  fields: ["title", "description", "items"],
  styles: { style_1: ScheduleStyle1, style_2: ScheduleStyle2, style_3: ScheduleStyle3 },
};

cmsSectionRegistry["faq"] = {
  label: "FAQ",
  fields: ["title", "description", "items"],
  styles: { style_1: FAQStyle1, style_2: FAQStyle2 },
};

cmsSectionRegistry["cta"] = {
  label: "Call to Action",
  fields: ["title", "description", "buttonLabel", "buttonUrl", "note"],
  styles: { style_1: CTAStyle1, style_2: CTAStyle2, style_3: CTAStyle3 },
};

cmsSectionRegistry["sponsor"] = {
  label: "Nhà tài trợ",
  fields: ["title", "description", "logos"],
  styles: { style_1: SponsorStyle1, style_2: SponsorStyle2 },
};

cmsSectionRegistry["note_alert"] = {
  label: "Thông báo",
  fields: ["title", "description", "content", "note", "tone"],
  styles: { style_1: NoteAlertStyle1, style_2: NoteAlertStyle2, style_3: NoteAlertStyle3 },
};

cmsSectionRegistry["ticket_preview"] = {
  label: "Bảng giá vé",
  fields: ["title", "description", "items", "note"],
  styles: { style_1: TicketPreviewStyle1, style_2: TicketPreviewStyle2 },
};
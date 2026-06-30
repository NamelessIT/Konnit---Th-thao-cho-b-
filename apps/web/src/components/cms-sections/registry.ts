import {
  cmsSectionRegistry,
  type SectionRegistryEntry,
} from "@konnit/ui";
import {
  CMS_COMPONENT_CONFIG,
  type CmsComponentType,
} from "@konnit/types";

// Hero
import { HeroStyle1 } from "./HeroSection/HeroStyle1";
import { HeroStyle2 } from "./HeroSection/HeroStyle2";
import { HeroStyle3 } from "./HeroSection/HeroStyle3";
import { HeroStyle4 } from "./HeroSection/HeroStyle4";
import { HeroStyle5 } from "./HeroSection/HeroStyle5";
// RichText
import { RichTextStyle1 } from "./RichTextSection/RichTextStyle1";
import { RichTextStyle2 } from "./RichTextSection/RichTextStyle2";
import { RichTextStyle3 } from "./RichTextSection/RichTextStyle3";
// ImageText
import { ImageTextStyle1 } from "./ImageTextSection/ImageTextStyle1";
import { ImageTextStyle2 } from "./ImageTextSection/ImageTextStyle2";
import { ImageTextStyle3 } from "./ImageTextSection/ImageTextStyle3";
import { ImageTextStyle4 } from "./ImageTextSection/ImageTextStyle4";
import { ImageTextStyle5 } from "./ImageTextSection/ImageTextStyle5";
// FeatureGrid
import { FeatureGridStyle1 } from "./FeatureGridSection/FeatureGridStyle1";
import { FeatureGridStyle2 } from "./FeatureGridSection/FeatureGridStyle2";
import { FeatureGridStyle3 } from "./FeatureGridSection/FeatureGridStyle3";
import { FeatureGridStyle4 } from "./FeatureGridSection/FeatureGridStyle4";
import { FeatureGridStyle5 } from "./FeatureGridSection/FeatureGridStyle5";
// Product (new type)
import { ProductStyle1 } from "./ProductSection/ProductStyle1";
import { ProductStyle2 } from "./ProductSection/ProductStyle2";
// ContactPanel (new type)
import { ContactPanelStyle1 } from "./ContactPanelSection/ContactPanelStyle1";
import { ContactPanelStyle2 } from "./ContactPanelSection/ContactPanelStyle2";
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
import { CTAStyle4 } from "./CTASection/CTAStyle4";
import { CTAStyle5 } from "./CTASection/CTAStyle5";
// FlowSteps (new type)
import { FlowStepsStyle1, FlowStepsStyle2, FlowStepsStyle3 } from "./FlowStepsSection/FlowSteps";
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

function registerSection(
  type: CmsComponentType,
  styles: SectionRegistryEntry["styles"],
) {
  const config = CMS_COMPONENT_CONFIG[type];
  cmsSectionRegistry[type] = {
    label: config.label,
    fields: [...config.fields],
    styles,
  };
}

registerSection("hero", {
  style_1: HeroStyle1,
  style_2: HeroStyle2,
  style_3: HeroStyle3,
  style_4: HeroStyle4,
  style_5: HeroStyle5,
});
registerSection("rich_text", {
  style_1: RichTextStyle1,
  style_2: RichTextStyle2,
  style_3: RichTextStyle3,
});
registerSection("image_text", {
  style_1: ImageTextStyle1,
  style_2: ImageTextStyle2,
  style_3: ImageTextStyle3,
  style_4: ImageTextStyle4,
  style_5: ImageTextStyle5,
});
registerSection("feature_grid", {
  style_1: FeatureGridStyle1,
  style_2: FeatureGridStyle2,
  style_3: FeatureGridStyle3,
  style_4: FeatureGridStyle4,
  style_5: FeatureGridStyle5,
});
registerSection("product", {
  style_1: ProductStyle1,
  style_2: ProductStyle2,
});
registerSection("contact_panel", {
  style_1: ContactPanelStyle1,
  style_2: ContactPanelStyle2,
});
registerSection("schedule", {
  style_1: ScheduleStyle1,
  style_2: ScheduleStyle2,
  style_3: ScheduleStyle3,
});
registerSection("faq", {
  style_1: FAQStyle1,
  style_2: FAQStyle2,
});
registerSection("cta", {
  style_1: CTAStyle1,
  style_2: CTAStyle2,
  style_3: CTAStyle3,
  style_4: CTAStyle4,
  style_5: CTAStyle5,
});
registerSection("flow_steps", {
  style_1: FlowStepsStyle1,
  style_2: FlowStepsStyle2,
  style_3: FlowStepsStyle3,
});
registerSection("sponsor", {
  style_1: SponsorStyle1,
  style_2: SponsorStyle2,
});
registerSection("note_alert", {
  style_1: NoteAlertStyle1,
  style_2: NoteAlertStyle2,
  style_3: NoteAlertStyle3,
});
registerSection("ticket_preview", {
  style_1: TicketPreviewStyle1,
  style_2: TicketPreviewStyle2,
});

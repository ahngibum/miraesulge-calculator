declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function push(event: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

export function trackCardClick(cardId: string) {
  push({ event: 'card_click', card_id: cardId });
}

export function trackOnboardingComplete(ageGroup: string) {
  push({ event: 'onboarding_complete', age_group: ageGroup });
}

export function trackResultView(cardId: string, ageGroup: string, achievable: boolean) {
  push({ event: 'calculator_result_view', card_id: cardId, age_group: ageGroup, achievable });
}

export function trackSliderAdjust(cardId: string, field: string) {
  push({ event: 'calculator_slider_adjust', card_id: cardId, adjusted_field: field });
}

export function trackCtaClick(cardId: string, buttonLabel: string) {
  push({ event: 'cta_click', card_id: cardId, button_label: buttonLabel });
}

export function getAgeGroup(age: number): string {
  if (age < 30) return '20s';
  if (age < 40) return '30s';
  if (age < 50) return '40s';
  if (age < 60) return '50s';
  return '60s+';
}

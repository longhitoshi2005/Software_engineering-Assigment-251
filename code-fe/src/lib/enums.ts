export const CLARITY_CHOICES = [
  { value: "VERY_CLEAR", label: "Very clear" },
  { value: "MOSTLY_CLEAR", label: "Mostly clear" },
  { value: "SOMEWHAT_UNCLEAR", label: "Somewhat unclear" },
  { value: "CONFUSING", label: "Confusing" },
];

export const UNDERSTANDING_CHOICES = [
  { value: "EXCELLENT", label: "Excellent - fully grasped" },
  { value: "GOOD", label: "Good - can apply" },
  { value: "FAIR", label: "Fair - needs more practice" },
  { value: "POOR", label: "Poor - struggled" },
];

export function getLabelByValue(list: { value: string; label: string }[], value: string) {
  const found = list.find((x) => x.value === value);
  return found ? found.label : value;
}

export default {
  CLARITY_CHOICES,
  UNDERSTANDING_CHOICES,
  getLabelByValue,
};

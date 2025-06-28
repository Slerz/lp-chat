const startQuestions = [
  { label: "Кто вы такие и как вам удалось построить крупную сеть?", value: "aboutCompany", next: "aboutCompany" },
  { label: "Какие инвестиции нужны для открытия одного магазина?", value: "investments", next: "city" },
  { label: "Какую прибыль может приносить рыбный магазин?", value: "profit", next: "city2" },
  { label: "Какую помощь мы окажем вам при открытии магазина?", value: "help", next: "help" },
  { label: "Как выглядят действующие магазины, которые вы открыли?", value: "gallery", next: "gallery" },
  { label: "Могу ли я пообщаться с владельцами магазинов сети?", value: "feedback", next: "feedback" },
  { label: "Хочу задать свой вопрос", value: "question", next: "question" }
];

export default startQuestions; 
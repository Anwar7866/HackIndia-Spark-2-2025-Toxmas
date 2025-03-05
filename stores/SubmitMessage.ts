import { v4 as uuidv4 } from "uuid";
import { Message } from "./Message";
import { streamCompletion } from "./OpenAI";
import { getChatById, updateChatMessages } from "./utils";
import { notifications } from "@mantine/notifications";
import { getModelInfo } from "./Model";
import { useChatStore } from "./ChatStore";

const get = useChatStore.getState;
const set = useChatStore.setState;
const LOCAL_STORAGE_INCOME_KEY = "incomeData";
const LOCAL_STORAGE_EXPENSE_KEY = "expenseData";

type FinanceEntry = {
  Source: string;
  Amount: number;
  Date: string;
};

const loadFinanceData = (): {
  income: FinanceEntry[];
  expenses: FinanceEntry[];
} => {
  const income = localStorage.getItem(LOCAL_STORAGE_INCOME_KEY);
  const expenses = localStorage.getItem(LOCAL_STORAGE_EXPENSE_KEY);

  return {
    income: income ? JSON.parse(income) : [],
    expenses: expenses ? JSON.parse(expenses) : [],
  };
};

export const abortCurrentRequest = () => {
  const currentAbortController = get().currentAbortController;
  if (currentAbortController?.abort) currentAbortController?.abort();
  set((state) => ({
    apiState: "idle",
    currentAbortController: undefined,
  }));
};

export const submitMessage = async (message: Message) => {
  if (message.content.trim() === "") {
    console.error("Message is empty");
    return;
  }

  const activeChatId = get().activeChatId;
  const chat = get().chats.find((c) => c.id === activeChatId!);
  if (chat === undefined) {
    console.error("Chat not found");
    return;
  }

  console.log("chat", chat.id);

  const index = chat.messages.findIndex((m) => m.id === message.id);
  if (index !== -1) {
    set((state) => ({
      chats: state.chats.map((c) => {
        if (c.id === chat.id) {
          c.messages = c.messages.slice(0, index);
        }

        return c;
      }),
    }));
  }

  set((state) => ({
    apiState: "loading",
    chats: state.chats.map((c) => {
      if (c.id === chat.id) {
        c.messages.push(message);
      }

      return c;
    }),
  }));

  const assistantMsgId = uuidv4();

  set((state) => ({
    chats: state.chats.map((c) => {
      if (c.id === state.activeChatId) {
        c.messages.push({
          id: assistantMsgId,
          content: "",
          role: "assistant",
          loading: true,
        });
      }

      return c;
    }),
  }));

  const apiKey = get().apiKey;
  if (apiKey === undefined) {
    console.error("API key not set");
    return;
  }

  const updateTokens = (
    promptTokensUsed: number,
    completionTokensUsed: number
  ) => {
    const activeModel = get().settingsForm.model;
    const { prompt: promptCost, completion: completionCost } =
      getModelInfo(activeModel).costPer1kTokens;
    set((state) => ({
      apiState: "idle",
      chats: state.chats.map((c) => {
        if (c.id === chat.id) {
          c.promptTokensUsed = (c.promptTokensUsed || 0) + promptTokensUsed;
          c.completionTokensUsed =
            (c.completionTokensUsed || 0) + completionTokensUsed;
          c.costIncurred =
            (c.costIncurred || 0) +
            (promptTokensUsed / 1000) * promptCost +
            (completionTokensUsed / 1000) * completionCost;
        }

        return c;
      }),
    }));
  };
  const settings = get().settingsForm;

  const abortController = new AbortController();
  set((state) => ({
    currentAbortController: abortController,
    ttsID: assistantMsgId,
    ttsText: "",
  }));

  const { income, expenses } = loadFinanceData();

  const incomeList =
    income.map((i) => `+₹${i.Amount} (${i.Source}, ${i.Date})`).join(", ") ||
    "None";
  const expenseList =
    expenses.map((e) => `-₹${e.Amount} (${e.Source}, ${e.Date})`).join(", ") ||
    "None";

  const msg1 = {
    id: uuidv4(),
    content:
      'Current Unix timestamp is : 1741170633 .You are a financial advisor. Your role is to track my expenses and income, providing me with a sharp, concise, and intelligent output every time. Your main tasks are: \r\n\r\n1. Net Profit Tracking: Log and calculate my daily net profit and monthly net profit based on my inputs. \r\n2. Input Parsing: \r\n - If the input starts with a + (e.g., "+2000 salary"), it represents an income. The number after + indicates the credited amount, and the text following the amount denotes tags (e.g., "salary"). \r\n - If the input starts with a - (e.g., "-100 food"), it represents an expense. The number after - indicates the debited amount, and the text following the amount denotes tags (e.g., "food"). \r\n3. Smart Suggestions: \r\n - If expenses are high, provide practical advice or suggestions to help me save money. \r\n - If income is high, suggest suitable investment opportunities like fixed deposits, real estate, gold, or the stock market, depending on the income value. \r\n4. Budget Analysis: Provide a brief analysis of my spending habits and income trends to help me manage my finances better. \r\n\r\nFor example: \r\n- Input: +2000 salary → Output: "Income logged: ₹2000 (salary). Net profit: ₹2000." \r\n- Input: -100 food → Output: "Expense logged: ₹100 (food). Net profit: ₹1900." \r\n- Input: -12 chocolate → Output: "Expense logged: ₹12 (chocolate). Net profit: ₹1888. Clear all my expenses and incomes. now from onwards start tracking." \r\n\r\nBe precise, provide actionable insights, and adapt your suggestions to help me achieve better financial health. respond with concise and smarter response.' +
      `Current data:
- Income: ${incomeList}
- Expenses: ${expenseList}

Provide actionable insights and advice to manage my finances effectively.`,
    role: "user",
  } as Message;

  await streamCompletion(
    [msg1, ...chat.messages],
    settings,
    apiKey,
    abortController,
    (content) => {
      set((state) => ({
        ttsText: (state.ttsText || "") + content,
        chats: updateChatMessages(state.chats, chat.id, (messages) => {
          const assistantMessage = messages.find(
            (m) => m.id === assistantMsgId
          );
          if (assistantMessage) {
            assistantMessage.content += content;
          }

          return messages;
        }),
      }));
    },
    (promptTokensUsed, completionTokensUsed) => {
      set((state) => ({
        apiState: "idle",
        chats: updateChatMessages(state.chats, chat.id, (messages) => {
          const assistantMessage = messages.find(
            (m) => m.id === assistantMsgId
          );
          if (assistantMessage) {
            assistantMessage.loading = false;
          }

          return messages;
        }),
      }));
      updateTokens(promptTokensUsed, completionTokensUsed);
      if (get().settingsForm.auto_title) {
        findChatTitle();
      }
    },
    (errorRes, errorBody) => {
      let message = errorBody;
      try {
        message = JSON.parse(errorBody).error.message;
      } catch (e) {}

      notifications.show({
        message: message,
        color: "red",
      });

      abortCurrentRequest();
    }
  );

  const findChatTitle = async () => {
    const chat = getChatById(get().chats, get().activeChatId);
    if (chat === undefined) {
      console.error("Chat not found");
      return;
    }

    const numWords = chat.messages
      .map((m) => m.content.split(" ").length)
      .reduce((a, b) => a + b, 0);
    if (
      chat.messages.length >= 2 &&
      chat.title === undefined &&
      numWords >= 4
    ) {
      const msg = {
        id: uuidv4(),
        content: `Describe the following conversation snippet in 3 words or less.
              >>>
              Hello
              ${chat.messages
                .slice(1)
                .map((m) => m.content)
                .join("\n")}
              `,
        role: "system",
      } as Message;

      await streamCompletion(
        [msg, ...chat.messages.slice(1)],
        settings,
        apiKey,
        undefined,
        (content) => {
          set((state) => ({
            chats: state.chats.map((c) => {
              if (c.id === chat.id) {
                chat.title = (chat.title || "") + content;
                if (chat.title.toLowerCase().startsWith("title:")) {
                  chat.title = chat.title.slice(6).trim();
                }

                chat.title = chat.title.replace(/[,.;:!?]$/, "");
              }

              return c;
            }),
          }));
        },
        updateTokens
      );
    }
  };
};

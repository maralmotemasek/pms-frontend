import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bot,
  RotateCcw,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";

import "./AIAssistant.css";


const STORAGE_KEY =
  "pms_ai_chat_v1";


const INITIAL_MESSAGES = [
  {
    id: 1,
    role: "assistant",
    text:
      "سلام! من دستیار هوشمند سیستم مدیریت پروژه هستم. درباره پروژه‌ها، وظایف و گزارش‌ها سؤال بپرسید.",
  },
];


const SUGGESTIONS = [
  "وضعیت پروژه‌ها را خلاصه کن",
  "وظایف مهم امروز چیست؟",
  "یک گزارش مدیریتی پیشنهاد بده",
];


function loadMessages() {
  try {
    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!saved) {
      return INITIAL_MESSAGES;
    }

    const parsed =
      JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : INITIAL_MESSAGES;
  } catch {
    return INITIAL_MESSAGES;
  }
}


function createDemoResponse(
  input
) {
  const normalized =
    input.toLowerCase();

  if (
    normalized.includes(
      "گزارش"
    )
  ) {
    return "برای گزارش مدیریتی بهتر است پیشرفت پروژه، تعداد وظایف تکمیل‌شده، وظایف معوق، بار کاری اعضا و وضعیت بودجه در یک نمای خلاصه ارائه شود.";
  }

  if (
    normalized.includes(
      "وظیفه"
    ) ||
    normalized.includes(
      "تسک"
    )
  ) {
    return "برای اولویت‌بندی وظایف، ابتدا موارد با اولویت بالا و موعد نزدیک را بررسی کنید و سپس وظایف مسدودکننده سایر اعضای تیم را در اولویت قرار دهید.";
  }

  if (
    normalized.includes(
      "پروژه"
    )
  ) {
    return "برای ارزیابی وضعیت پروژه، درصد پیشرفت، وظایف باز، تأخیرها، منابع درگیر و انحراف از زمان‌بندی یا بودجه باید هم‌زمان بررسی شوند.";
  }

  return "رابط کاربری دستیار آماده است. پاسخ فعلی در حالت Demo محلی تولید شده و پس از آماده‌شدن سرویس AI در Backend، پیام‌ها مستقیماً به API هوش مصنوعی متصل می‌شوند.";
}


function AIAssistant() {
  const [
    messages,
    setMessages,
  ] = useState(loadMessages);

  const [
    input,
    setInput,
  ] = useState("");

  const [
    isTyping,
    setIsTyping,
  ] = useState(false);

  const messageIdRef =
    useRef(1000);


  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        messages
      )
    );
  }, [messages]);


  const getNextMessageId =
    () => {
      messageIdRef.current += 1;

      return messageIdRef.current;
    };


  const sendMessage = (
    rawMessage
  ) => {
    const cleanMessage =
      rawMessage.trim();

    if (
      !cleanMessage ||
      isTyping
    ) {
      return;
    }


    const userMessage = {
      id:
        getNextMessageId(),

      role: "user",

      text:
        cleanMessage,
    };


    setMessages(
      (current) => [
        ...current,
        userMessage,
      ]
    );

    setInput("");

    setIsTyping(true);


    window.setTimeout(
      () => {
        const assistantMessage = {
          id:
            getNextMessageId(),

          role:
            "assistant",

          text:
            createDemoResponse(
              cleanMessage
            ),
        };


        setMessages(
          (current) => [
            ...current,
            assistantMessage,
          ]
        );


        setIsTyping(false);
      },

      500
    );
  };


  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    sendMessage(
      input
    );
  };


  const clearConversation =
    () => {
      setMessages(
        INITIAL_MESSAGES
      );

      setInput("");
    };


  return (
    <section
      className="ai-assistant-page"
      dir="rtl"
    >

      <div className="ai-chat-shell">

        <header className="ai-chat-header">

          <div className="ai-chat-title">

            <div className="ai-logo">
              <Sparkles
                size={22}
              />
            </div>


            <div>

              <h1>
                دستیار هوشمند
              </h1>

              <p>
                AI Project Assistant
              </p>

            </div>

          </div>


          <button
            type="button"
            className="ai-reset-button"
            onClick={
              clearConversation
            }
          >
            <RotateCcw
              size={16}
            />

            گفت‌وگوی جدید
          </button>

        </header>


        <div className="ai-demo-banner">

          <Bot
            size={17}
          />

          <span>
            حالت Demo Frontend فعال است.
            اتصال واقعی به مدل AI پس از
            آماده‌شدن API Backend انجام
            می‌شود.
          </span>

        </div>


        <div className="ai-messages">

          {messages.map(
            (message) => (

              <div
                key={
                  message.id
                }
                className={`ai-message ${
                  message.role ===
                  "user"
                    ? "user"
                    : "assistant"
                }`}
              >

                <div className="ai-message-avatar">

                  {message.role ===
                  "user" ? (

                    <UserRound
                      size={18}
                    />

                  ) : (

                    <Sparkles
                      size={18}
                    />

                  )}

                </div>


                <div className="ai-message-content">

                  <strong>

                    {message.role ===
                    "user"
                      ? "شما"
                      : "دستیار هوشمند"}

                  </strong>


                  <p>
                    {
                      message.text
                    }
                  </p>

                </div>

              </div>

            )
          )}


          {isTyping && (

            <div className="ai-message assistant">

              <div className="ai-message-avatar">

                <Sparkles
                  size={18}
                />

              </div>


              <div className="ai-message-content">

                <strong>
                  دستیار هوشمند
                </strong>


                <div className="ai-typing">
                  <span />
                  <span />
                  <span />
                </div>

              </div>

            </div>

          )}

        </div>


        <div className="ai-suggestions">

          {SUGGESTIONS.map(
            (suggestion) => (

              <button
                type="button"
                key={
                  suggestion
                }
                onClick={() =>
                  sendMessage(
                    suggestion
                  )
                }
              >
                {
                  suggestion
                }
              </button>

            )
          )}

        </div>


        <form
          className="ai-composer"
          onSubmit={
            handleSubmit
          }
        >

          <textarea
            value={
              input
            }
            onChange={(
              event
            ) =>
              setInput(
                event.target.value
              )
            }
            placeholder="پیام خود را برای دستیار هوشمند بنویسید..."
            rows={1}
            onKeyDown={(
              event
            ) => {

              if (
                event.key ===
                  "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();

                sendMessage(
                  input
                );
              }

            }}
          />


          <button
            type="submit"
            disabled={
              !input.trim() ||
              isTyping
            }
            aria-label="ارسال پیام"
          >
            <Send
              size={19}
            />
          </button>

        </form>

      </div>

    </section>
  );
}


export default AIAssistant;
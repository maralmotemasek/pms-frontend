import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Hash,
  MessageSquare,
  Search,
  Send,
  Users,
} from "lucide-react";

import {
  getCurrentUser,
} from "../../services/authService";

import "./InternalChat.css";


const STORAGE_KEY =
  "pms_internal_chat_v1";


const CHANNELS = [
  {
    id: "general",
    title: "عمومی",
    description: "گفت‌وگوی عمومی تیم",
    icon: Hash,
  },

  {
    id: "development",
    title: "توسعه",
    description: "هماهنگی فنی و توسعه",
    icon: MessageSquare,
  },

  {
    id: "design",
    title: "طراحی",
    description: "هماهنگی UI و UX",
    icon: Users,
  },
];


const DEFAULT_MESSAGES = {
  general: [
    {
      id: 1,
      sender: "سیستم",
      text:
        "کانال عمومی تیم آماده است.",
      time: "اکنون",
      own: false,
    },
  ],

  development: [
    {
      id: 2,
      sender: "سیستم",
      text:
        "بحث‌های فنی پروژه را در این کانال دنبال کنید.",
      time: "اکنون",
      own: false,
    },
  ],

  design: [
    {
      id: 3,
      sender: "سیستم",
      text:
        "موضوعات طراحی و رابط کاربری را اینجا هماهنگ کنید.",
      time: "اکنون",
      own: false,
    },
  ],
};


function loadMessages() {
  try {
    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!saved) {
      return DEFAULT_MESSAGES;
    }

    const parsed =
      JSON.parse(saved);

    return {
      ...DEFAULT_MESSAGES,
      ...parsed,
    };
  } catch {
    return DEFAULT_MESSAGES;
  }
}


function InternalChat() {
  const [
    user,
    setUser,
  ] = useState(null);

  const [
    selectedChannelId,
    setSelectedChannelId,
  ] = useState("general");

  const [
    searchValue,
    setSearchValue,
  ] = useState("");

  const [
    messageText,
    setMessageText,
  ] = useState("");

  const [
    messages,
    setMessages,
  ] = useState(loadMessages);


  useEffect(() => {
    const loadUser =
      async () => {
        try {
          const currentUser =
            await getCurrentUser();

          setUser(
            currentUser
          );
        } catch (error) {
          console.error(
            "Chat user loading error:",
            error
          );
        }
      };

    loadUser();
  }, []);


  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        messages
      )
    );
  }, [messages]);


  const filteredChannels =
    useMemo(() => {

      const query =
        searchValue
          .trim()
          .toLowerCase();

      if (!query) {
        return CHANNELS;
      }

      return CHANNELS.filter(
        (channel) =>
          channel.title
            .toLowerCase()
            .includes(
              query
            ) ||
          channel.description
            .toLowerCase()
            .includes(
              query
            )
      );

    }, [searchValue]);


  const selectedChannel =
    CHANNELS.find(
      (channel) =>
        channel.id ===
        selectedChannelId
    ) || CHANNELS[0];


  const selectedMessages =
    messages[
      selectedChannelId
    ] || [];


  const handleSend = (
    event
  ) => {

    event.preventDefault();

    const cleanText =
      messageText.trim();

    if (!cleanText) {
      return;
    }


    const newMessage = {
      id:
        Date.now(),

      sender:
        user?.full_name ||
        user?.username ||
        "من",

      text:
        cleanText,

      time:
        new Date()
          .toLocaleTimeString(
            "fa-IR",
            {
              hour:
                "2-digit",

              minute:
                "2-digit",
            }
          ),

      own: true,
    };


    setMessages(
      (current) => ({

        ...current,

        [selectedChannelId]: [
          ...(
            current[
              selectedChannelId
            ] || []
          ),

          newMessage,
        ],
      })
    );


    setMessageText("");
  };


  return (
    <section
      className="internal-chat-page"
      dir="rtl"
    >

      <aside className="internal-chat-sidebar">

        <div className="chat-sidebar-heading">

          <div>
            <h1>
              چت تیمی
            </h1>

            <span>
              کانال‌های ارتباطی
            </span>
          </div>

          <MessageSquare
            size={22}
          />

        </div>


        <div className="chat-search">

          <Search
            size={17}
          />

          <input
            type="search"
            value={
              searchValue
            }
            onChange={(
              event
            ) =>
              setSearchValue(
                event.target.value
              )
            }
            placeholder="جستجو در کانال‌ها..."
          />

        </div>


        <div className="chat-channel-list">

          {filteredChannels.map(
            (
              channel
            ) => {

              const Icon =
                channel.icon;

              const isActive =
                channel.id ===
                selectedChannelId;


              return (
                <button
                  type="button"
                  key={
                    channel.id
                  }
                  className={
                    isActive
                      ? "chat-channel active"
                      : "chat-channel"
                  }
                  onClick={() =>
                    setSelectedChannelId(
                      channel.id
                    )
                  }
                >

                  <span className="chat-channel-icon">
                    <Icon
                      size={18}
                    />
                  </span>


                  <span>

                    <strong>
                      {
                        channel.title
                      }
                    </strong>

                    <small>
                      {
                        channel.description
                      }
                    </small>

                  </span>

                </button>
              );
            }
          )}

        </div>


        <div className="chat-local-notice">
          نسخه فعلی Frontend Demo است.
          <br />
          اتصال WebSocket بعد از آماده‌شدن Backend انجام می‌شود.
        </div>

      </aside>


      <div className="internal-chat-main">

        <header className="chat-main-header">

          <div>

            <h2>
              #
              {
                selectedChannel.title
              }
            </h2>

            <p>
              {
                selectedChannel.description
              }
            </p>

          </div>


          <div className="chat-online-badge">

            <span />

            فعال

          </div>

        </header>


        <div className="chat-messages">

          {selectedMessages.length ===
          0 ? (

            <div className="chat-empty">
              هنوز پیامی در این کانال وجود ندارد.
            </div>

          ) : (

            selectedMessages.map(
              (
                message
              ) => (

                <div
                  key={
                    message.id
                  }
                  className={
                    message.own
                      ? "chat-message own"
                      : "chat-message"
                  }
                >

                  <div className="chat-avatar">
                    {
                      message.sender
                        .trim()
                        .charAt(0)
                    }
                  </div>


                  <div className="chat-message-body">

                    <div className="chat-message-meta">

                      <strong>
                        {
                          message.sender
                        }
                      </strong>

                      <span>
                        {
                          message.time
                        }
                      </span>

                    </div>


                    <div className="chat-message-bubble">
                      {
                        message.text
                      }
                    </div>

                  </div>

                </div>
              )
            )

          )}

        </div>


        <form
          className="chat-composer"
          onSubmit={
            handleSend
          }
        >

          <input
            type="text"
            value={
              messageText
            }
            onChange={(
              event
            ) =>
              setMessageText(
                event.target.value
              )
            }
            placeholder={
              `پیام به #${selectedChannel.title}`
            }
          />


          <button
            type="submit"
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


export default InternalChat;
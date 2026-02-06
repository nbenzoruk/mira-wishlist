import { useState, useEffect } from "react";

const WISHLIST_ITEMS = [
  {
    id: 1,
    title: "Матрас для кроватки Happy Baby Mommy Lux 140×70",
    price: "~8 000 ₽",
    link: "https://happybaby.ru/catalog/detskaya-komnata/matras_dlya_krovatki_mommy_lux_140kh70sm/offer/56158/",
    store: "Happy Baby",
    emoji: "🛏️",
    category: "practical",
  },
  {
    id: 2,
    title: "Подарок с Ozon",
    price: "",
    link: "https://ozon.ru/t/zq8Z5ye",
    store: "Ozon",
    emoji: "🎁",
    category: "surprise",
    note: "Открой ссылку, чтобы увидеть товар",
  },
  {
    id: 3,
    title: "Органайзер для резинок, заколок и украшений (aomka)",
    price: "",
    link: "https://www.wildberries.ru/catalog/139128212/detail.aspx?size=236268547",
    store: "Wildberries",
    emoji: "🎀",
    category: "accessories",
  },
  {
    id: 4,
    title: "Пена для ванны и маленькие бомбочки",
    price: "",
    link: null,
    store: "Любой магазин",
    emoji: "🛁",
    category: "fun",
    note: "Детская пена для ванны + набор маленьких бомбочек",
  },
  {
    id: 5,
    title: "Морская капуста хрустящая, листы нори",
    price: "~100 ₽",
    link: "https://vkusvill.ru/goods/xmlid/78715",
    store: "ВкусВилл",
    emoji: "🥬",
    category: "yummy",
    note: "Да, Мира обожает хрустящие нори! 😄",
  },
  {
    id: 6,
    title: 'Интерактивный трек «Космос», 5 машин',
    price: "1 795 ₽",
    link: "https://market.yandex.ru/cc/8gZLNP",
    store: "Яндекс Маркет",
    emoji: "🚀",
    category: "toys",
    note: "Есть и другие расцветки на Маркете",
  },
  {
    id: 7,
    title: "Набор для рисования и творчества, 208 предметов, розовый, с мольбертом",
    price: "1 594 ₽",
    link: "https://market.yandex.ru/cc/8gZNNN",
    store: "Яндекс Маркет",
    emoji: "🎨",
    category: "creative",
  },
  {
    id: 8,
    title: "Любимые мультики (диски / подписки / мерч)",
    price: "",
    link: null,
    store: "",
    emoji: "📺",
    category: "fun",
    note: "Кошечки-Собачки, Малышарики, Совёнок Хоп-Хоп",
  },
  {
    id: 9,
    title: "🎁 От мамы: Барабанная установка с подсветкой, розовая",
    price: "5 850 ₽",
    link: "https://market.yandex.ru/cc/8hCyTG",
    store: "Яндекс Маркет",
    emoji: "🥁",
    category: "from_mom",
    reserved: true,
    reservedBy: "Мама 💕",
  },
  {
    id: 10,
    title: 'Набор для рисования Авель «Герои кино, мультфильмов и игр», 208 элементов',
    price: "1 586 ₽",
    link: "https://market.yandex.ru/cc/8iFZMB",
    store: "Яндекс Маркет",
    emoji: "✏️",
    category: "creative",
  },
];

const STORAGE_KEY = "mira-wishlist-reservations";

const CATEGORY_COLORS = {
  practical: { bg: "#FFF7ED", border: "#FB923C", tag: "Полезное" },
  surprise: { bg: "#FFF1F2", border: "#FB7185", tag: "Сюрприз" },
  accessories: { bg: "#FDF2F8", border: "#EC4899", tag: "Аксессуары" },
  fun: { bg: "#F0FDF4", border: "#4ADE80", tag: "Веселье" },
  yummy: { bg: "#ECFDF5", border: "#34D399", tag: "Вкусняшки" },
  toys: { bg: "#EFF6FF", border: "#60A5FA", tag: "Игрушки" },
  creative: { bg: "#F5F3FF", border: "#A78BFA", tag: "Творчество" },
  from_mom: { bg: "#FFF1F2", border: "#F43F5E", tag: "От мамы" },
};

function StarDecor({ style }) {
  return (
    <div
      style={{
        position: "absolute",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "rgba(251, 191, 36, 0.5)",
        animation: "twinkle 3s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export default function MiraWishlist() {
  const [reservations, setReservations] = useState({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  async function loadReservations() {
    try {
      const result = await window.storage.get(STORAGE_KEY, true);
      if (result && result.value) {
        setReservations(JSON.parse(result.value));
      }
    } catch (e) {
      console.log("No reservations yet");
    }
    setLoading(false);
  }

  async function saveReservation(itemId, name) {
    const updated = { ...reservations, [itemId]: name };
    setReservations(updated);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(updated), true);
      setToast(`✅ Подарок забронирован!`);
    } catch (e) {
      setToast("⚠️ Ошибка сохранения");
    }
  }

  async function cancelReservation(itemId) {
    const updated = { ...reservations };
    delete updated[itemId];
    setReservations(updated);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(updated), true);
      setToast("Бронирование отменено");
    } catch (e) {
      setToast("⚠️ Ошибка");
    }
  }

  function handleReserve(item) {
    setModal(item);
    setGuestName("");
  }

  function handleConfirmReserve() {
    if (!guestName.trim()) return;
    saveReservation(modal.id, guestName.trim());
    setModal(null);
  }

  function isReserved(item) {
    return item.reserved || reservations[item.id];
  }

  function getReservedBy(item) {
    return item.reservedBy || reservations[item.id];
  }

  const availableCount = WISHLIST_ITEMS.filter(
    (i) => !isReserved(i)
  ).length;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFBF5",
          fontFamily: "'Georgia', serif",
        }}
      >
        <div style={{ fontSize: 32, animation: "pulse 1.5s ease-in-out infinite" }}>
          🎂 Загружаем вишлист...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FFFBF5 0%, #FFF5EB 30%, #FFEEF8 70%, #FFF5EB 100%)",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Nunito:wght@400;600;700&display=swap');

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-60px) rotate(360deg); opacity: 0; }
        }
        @keyframes toastIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .wishlist-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .wishlist-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.08);
        }
        .reserve-btn {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .reserve-btn:hover {
          transform: scale(1.03);
          filter: brightness(1.05);
        }
        .reserve-btn:active {
          transform: scale(0.98);
        }
        .link-btn {
          transition: all 0.2s ease;
        }
        .link-btn:hover {
          background: rgba(0,0,0,0.04);
        }
      `}</style>

      {/* Decorative stars */}
      <StarDecor style={{ top: "5%", left: "10%", animationDelay: "0s" }} />
      <StarDecor style={{ top: "12%", right: "15%", animationDelay: "1s" }} />
      <StarDecor style={{ top: "8%", left: "45%", animationDelay: "2s" }} />
      <StarDecor style={{ top: "20%", right: "30%", animationDelay: "0.5s" }} />
      <StarDecor style={{ top: "15%", left: "25%", animationDelay: "1.5s" }} />

      {/* Header */}
      <div
        style={{
          textAlign: "center",
          padding: "48px 20px 20px",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: 56,
            animation: "float 4s ease-in-out infinite",
            marginBottom: 8,
          }}
        >
          🎂
        </div>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(28px, 6vw, 44px)",
            fontWeight: 700,
            color: "#1a1a1a",
            margin: "0 0 8px",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
          }}
        >
          Вишлист для Миры
        </h1>
        <p
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: "clamp(14px, 3vw, 17px)",
            color: "#888",
            margin: "0 0 4px",
            fontWeight: 400,
          }}
        >
          День рождения
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 13,
              color: "#aaa",
              background: "rgba(0,0,0,0.03)",
              padding: "6px 14px",
              borderRadius: 20,
            }}
          >
            Доступно для бронирования: <strong style={{ color: "#F97316" }}>{availableCount}</strong> из{" "}
            {WISHLIST_ITEMS.length}
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div
        style={{
          maxWidth: 560,
          margin: "12px auto 28px",
          padding: "14px 20px",
          background: "rgba(251, 191, 36, 0.08)",
          border: "1px solid rgba(251, 191, 36, 0.2)",
          borderRadius: 14,
          textAlign: "center",
          fontFamily: "'Nunito', sans-serif",
          fontSize: 14,
          color: "#92400E",
          lineHeight: 1.5,
        }}
      >
        Нажмите <strong>«Забронировать»</strong>, чтобы другие гости видели, что подарок уже выбран. Мира не увидит, кто что дарит 🤫
      </div>

      {/* Cards */}
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "0 16px 60px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {WISHLIST_ITEMS.map((item, idx) => {
          const reserved = isReserved(item);
          const cat = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.fun;

          return (
            <div
              key={item.id}
              className="wishlist-card"
              style={{
                background: reserved ? "#FAFAFA" : "#fff",
                borderRadius: 16,
                padding: "18px 20px",
                border: `1.5px solid ${reserved ? "#E5E5E5" : cat.border + "40"}`,
                position: "relative",
                opacity: reserved ? 0.75 : 1,
                animation: `fadeInUp 0.5s ease ${idx * 0.06}s both`,
              }}
            >
              {/* Category tag */}
              <div
                style={{
                  position: "absolute",
                  top: -9,
                  right: 16,
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: cat.border,
                  background: cat.bg,
                  border: `1px solid ${cat.border}30`,
                  padding: "2px 10px",
                  borderRadius: 8,
                }}
              >
                {cat.tag}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                }}
              >
                {/* Emoji */}
                <div
                  style={{
                    fontSize: 32,
                    lineHeight: 1,
                    flexShrink: 0,
                    marginTop: 2,
                    filter: reserved ? "grayscale(0.5)" : "none",
                  }}
                >
                  {item.emoji}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 15,
                      fontWeight: 600,
                      color: reserved ? "#999" : "#1a1a1a",
                      lineHeight: 1.35,
                      textDecoration: reserved ? "line-through" : "none",
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </div>

                  {item.note && (
                    <div
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 12,
                        color: "#999",
                        fontStyle: "italic",
                        marginBottom: 4,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.note}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      marginTop: 6,
                    }}
                  >
                    {item.price && (
                      <span
                        style={{
                          fontFamily: "'Nunito', sans-serif",
                          fontSize: 14,
                          fontWeight: 700,
                          color: reserved ? "#bbb" : "#F97316",
                        }}
                      >
                        {item.price}
                      </span>
                    )}

                    {item.store && (
                      <span
                        style={{
                          fontFamily: "'Nunito', sans-serif",
                          fontSize: 11,
                          color: "#bbb",
                          background: "#f5f5f5",
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {item.store}
                      </span>
                    )}
                  </div>

                  {/* Action row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-btn"
                        style={{
                          fontFamily: "'Nunito', sans-serif",
                          fontSize: 12,
                          color: "#60A5FA",
                          textDecoration: "none",
                          padding: "5px 12px",
                          borderRadius: 8,
                          border: "1px solid #60A5FA30",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        🔗 Открыть
                      </a>
                    )}

                    {reserved ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Nunito', sans-serif",
                            fontSize: 12,
                            color: "#10B981",
                            background: "#ECFDF5",
                            padding: "5px 12px",
                            borderRadius: 8,
                            border: "1px solid #10B98130",
                          }}
                        >
                          ✅ Забронировал(а): {getReservedBy(item)}
                        </span>
                        {!item.reserved && (
                          <button
                            onClick={() => setConfirmCancel(item.id)}
                            style={{
                              fontFamily: "'Nunito', sans-serif",
                              fontSize: 11,
                              color: "#ccc",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "4px 6px",
                              textDecoration: "underline",
                            }}
                          >
                            отмена
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        className="reserve-btn"
                        onClick={() => handleReserve(item)}
                        style={{
                          fontFamily: "'Nunito', sans-serif",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#fff",
                          background: `linear-gradient(135deg, ${cat.border}, ${cat.border}CC)`,
                          border: "none",
                          padding: "6px 16px",
                          borderRadius: 10,
                        }}
                      >
                        Забронировать
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "20px 20px 40px",
          fontFamily: "'Nunito', sans-serif",
          fontSize: 13,
          color: "#ccc",
        }}
      >
        Сделано с 💕 для Миры
      </div>

      {/* Reserve modal */}
      {modal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "28px 24px",
              maxWidth: 380,
              width: "100%",
              animation: "slideIn 0.2s ease",
              boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>{modal.emoji}</div>
              <div
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  lineHeight: 1.3,
                }}
              >
                {modal.title}
              </div>
            </div>

            <div
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 13,
                color: "#888",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Укажите ваше имя, чтобы другие гости знали, что подарок забронирован
            </div>

            <input
              type="text"
              placeholder="Ваше имя"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirmReserve()}
              autoFocus
              style={{
                width: "100%",
                boxSizing: "border-box",
                fontFamily: "'Nunito', sans-serif",
                fontSize: 15,
                padding: "12px 16px",
                borderRadius: 12,
                border: "2px solid #F3F3F3",
                outline: "none",
                textAlign: "center",
                marginBottom: 14,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#F97316")}
              onBlur={(e) => (e.target.style.borderColor = "#F3F3F3")}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setModal(null)}
                style={{
                  flex: 1,
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "11px",
                  borderRadius: 12,
                  border: "1.5px solid #E5E5E5",
                  background: "#fff",
                  color: "#999",
                  cursor: "pointer",
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmReserve}
                className="reserve-btn"
                style={{
                  flex: 1.5,
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  padding: "11px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, #F97316, #FB923C)",
                  color: "#fff",
                  opacity: guestName.trim() ? 1 : 0.4,
                }}
              >
                🎁 Забронировать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirmation */}
      {confirmCancel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setConfirmCancel(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "28px 24px",
              maxWidth: 340,
              width: "100%",
              animation: "slideIn 0.2s ease",
              textAlign: "center",
              boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                color: "#1a1a1a",
                marginBottom: 16,
              }}
            >
              Отменить бронирование?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmCancel(null)}
                style={{
                  flex: 1,
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 14,
                  padding: "10px",
                  borderRadius: 12,
                  border: "1.5px solid #E5E5E5",
                  background: "#fff",
                  color: "#999",
                  cursor: "pointer",
                }}
              >
                Нет
              </button>
              <button
                onClick={() => {
                  cancelReservation(confirmCancel);
                  setConfirmCancel(null);
                }}
                style={{
                  flex: 1,
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "10px",
                  borderRadius: 12,
                  border: "none",
                  background: "#EF4444",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Да, отменить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'Nunito', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            padding: "10px 24px",
            borderRadius: 14,
            zIndex: 2000,
            animation: "toastIn 0.3s ease",
            whiteSpace: "nowrap",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

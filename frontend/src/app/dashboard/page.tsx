"use client";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  JSX,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

interface Chat {
  _id: string;
  name: string;
  usersId?: string[];
  desc?: string;
}
interface Message {
  _id: string;
  userId: string;
  content: string;
  timestamp: string;
}
interface User {
  _id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  name?: string;
}

export default function Dashboard(): JSX.Element {
  const { userId, token, username, logout, isLogged, authLoading } = useAuth();
  const router = useRouter();

  // Estados principais
  const [chats, setChats] = useState<Chat[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  // Loading flags
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchType, setSearchType] = useState<"users" | "public">("users");
  const [query, setQuery] = useState("");
  const [userResults, setUserResults] = useState<User[]>([]);
  const [chatResults, setChatResults] = useState<Chat[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [isCreatePublicModalOpen, setIsCreatePublicModalOpen] = useState(false);
  const [publicChatName, setPublicChatName] = useState("");
  const [publicChatDesc, setPublicChatDesc] = useState("");

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io("http://localhost:8080", {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect_error", (error) => {
      console.error(`Socket connect error: ${error}`);
    });

    socket.on("newMessage", (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) {
          return prev;
        }
        return [...prev, msg];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (!socketRef.current || !selectedChat) return;
    setMessages([]);
    socketRef.current.emit("joinRoom", selectedChat._id);
  }, [selectedChat]);

  // carrega side panel ao carregar
  useEffect(() => {
    if (!userId || !token) return;
    // chats
    (async () => {
      try {
        const res = await fetch(`/chat/getuserchat/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setChats(data.chats || []);
      } catch {
        setChats([]);
      } finally {
        setLoadingChats(false);
      }
    })();
    // friendlist
    (async () => {
      try {
        const res = await fetch("/user/friendlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const all: User[] = (await res.json()).data || [];
        setFriends(all.filter((u) => u._id !== userId));
      } catch {
        setFriends([]);
      } finally {
        setLoadingFriends(false);
      }
    })();
  }, [userId, token]);

  useEffect(() => {
    if (!selectedChat || !token) {
      setMessages([]);
      return;
    }

    setMessages([]);

    (async () => {
      try {
        const res = await fetch(`/message/getchatmessage/${selectedChat._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMessages(data.messages || []);
      } catch {
        setMessages([]);
      }
    })();
  }, [selectedChat, token]);

  useEffect(() => {
    if (!authLoading && !isLogged) router.replace("/");
  }, [authLoading, isLogged, router]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedChat) return;
    try {
      const res = await fetch(`/message/createmessage/${selectedChat._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input }),
      });
      if (!res.ok) throw new Error();
      const { result } = await res.json();
      const newMsg: Message = {
        _id: result._id,
        userId: result.userId,
        content: result.content,
        timestamp: result.createdAt || new Date().toISOString(),
      };
      socketRef.current?.emit("sendMessage", {
        chatId: selectedChat._id,
        ...newMsg,
      });
      setInput("");
    } catch {
      console.error("Falha ao enviar mensagem");
    }
  };

  const handleCreateChat = async (
    friendId: string,
    fname: string,
    lname: string,
  ) => {
    try {
      const res = await fetch(`/chat/createchat/${friendId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          desc: "private",
          isPrivate: true,
          name: `${fname} ${lname}`,
        }),
      });
      if (!res.ok) throw new Error();
      const { data: newChat } = await res.json();
      const chatObj: Chat = {
        _id: newChat._id,
        name: newChat.name,
        usersId: newChat.usersId,
      };
      setChats((prev) =>
        prev.some((c) => c._id === chatObj._id) ? prev : [...prev, chatObj],
      );
      setSelectedChat(chatObj);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Falha ao criar chat:", err);
    }
  };

  const openCreatePublicModal = () => {
    setPublicChatName("");
    setPublicChatDesc("");
    setIsCreatePublicModalOpen(true);
  };

  const handleCreatePublicChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!publicChatName.trim()) return;

    try {
      const res = await fetch(`/chat/createchat/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          desc: "group",
          isPrivate: false,
          name: publicChatName,
          description: publicChatDesc || "Chat público",
        }),
      });

      if (!res.ok) throw new Error();
      const { data } = await res.json();

      setChats((prev) =>
        prev.some((c) => c._id === data._id) ? prev : [...prev, data],
      );
      setSelectedChat(data);
      setIsCreatePublicModalOpen(false);
    } catch (err) {
      console.error("Falha ao criar chat público:", err);
    }
  };

  const openSearch = () => {
    setQuery("");
    setChatResults([]);
    setIsModalOpen(true);
  };

  const handleSearch = async () => {
    setLoadingSearch(true);
    try {
      let fetchedChat: Chat[] = [];
      let fetched: User[] = [];
      if (searchType === "users") {
        if (query.trim()) {
          const res = await fetch(
            `http://localhost:8080/user/getuser/${query.trim()}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const { users } = await res.json();
          fetched = [users];
        } else {
          const res = await fetch("http://localhost:8080/user/getuser/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const { users } = await res.json();
          fetched = users;
        }
        setUserResults(fetched);
      } else {
        if (query.trim()) {
          const res = await fetch(
            `http://localhost:8080/chat/getchat/${query.trim()}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const { chat } = await res.json();
          fetchedChat = [chat];
        } else {
          const res = await fetch("http://localhost:8080/chat/getchat/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const { chat } = await res.json();
          fetchedChat = chat;
          console.log(fetchedChat);
        }
        setChatResults(fetchedChat);
      }
    } catch {
      setUserResults([]);
      setChatResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleJoinPublicChat = async (chatId: string) => {
    try {
      const res = await fetch(`/chat/joinchat/${chatId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const { data: joined } = await res.json();
      setChats((prev) =>
        prev.some((c) => c._id === joined._id) ? prev : [...prev, joined],
      );
      setSelectedChat(joined);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Falha ao entrar no chat público:", err);
    }
  };

  if (authLoading || !isLogged) {
    return (
      <div className="h-screen flex items-center justify-center">
        {authLoading ? "Carregando…" : null}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between bg-gray-800 text-white p-4">
        <div className="text-xl font-bold">Furia Web Chat</div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={openCreatePublicModal}
            className="bg-green-500 hover:bg-green-600 transition-colors px-3 py-1 rounded text-sm"
          >
            Criar Chat Público
          </button>
          <button
            type="button"
            onClick={openSearch}
            className="bg-blue-500 hover:bg-blue-600 transition-colors px-3 py-1 rounded text-sm"
          >
            Procurar
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <span>{username}</span>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/");
            }}
            className="bg-red-500 hover:bg-red-600 transition-colors px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chats List */}
        <aside className="w-1/4 bg-gray-100 p-4 overflow-y-auto text-black">
          <h2 className="font-semibold mb-2">Meus Chats</h2>
          {loadingChats ? (
            <p>Carregando chats…</p>
          ) : chats.length > 0 ? (
            <ul className="space-y-2">
              {chats.map((chat) => {
                let title = chat.name;

                if (chat.desc === "private" && chat.usersId) {
                  const otherId = chat.usersId.find((id) => id !== userId);
                  const other = friends.find((f) => f._id === otherId);

                  if (other) {
                    title = `${other.first_name} ${other.last_name}`;
                  }
                }
                return (
                  <li
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-2 rounded cursor-pointer ${
                      selectedChat?._id === chat._id
                        ? "bg-blue-200"
                        : "bg-white hover:bg-blue-50 transition-colors"
                    }`}
                  >
                    {title}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>Chats não encontrados.</p>
          )}
        </aside>

        {/* Messages Panel */}
        <main className="flex-1 bg-gray-50 flex flex-col p-4 overflow-hidden text-black">
          <h2 className="font-semibold mb-2">
            {selectedChat ? selectedChat.name : "Selecione um chat"}
          </h2>
          <div className="flex-1 space-y-2 overflow-y-auto p-2">
            {messages.map((msg, idx) => (
              <div
                key={msg._id ?? idx}
                className={`max-w-xs p-2 rounded ${
                  msg.userId === userId
                    ? "bg-green-200 self-end ml-auto"
                    : "bg-white self-start"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="mt-2 flex">
            <input
              value={input}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setInput(e.target.value)
              }
              type="text"
              placeholder="Digite sua mensagem..."
              className="flex-1 border border-gray-300 rounded-l px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
              disabled={!selectedChat}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-4 rounded-r disabled:bg-blue-300"
              disabled={!selectedChat}
            >
              Enviar
            </button>
          </form>
        </main>

        {/* Friends List */}
        <aside className="w-1/4 bg-gray-100 p-4 overflow-y-auto text-black">
          <h2 className="font-semibold mb-2">Friends</h2>
          {loadingFriends ? (
            <p>Carregando amigos…</p>
          ) : friends.length > 0 ? (
            <ul className="space-y-2">
              {friends.map((f) => (
                <li
                  key={f._id}
                  className="p-2 bg-white hover:bg-gray-50 transition-colors rounded flex justify-between items-center"
                >
                  {f.username}
                  <button
                    type="button"
                    onClick={() =>
                      handleCreateChat(f._id, f.first_name, f.last_name)
                    }
                    className="text-sm bg-blue-500 hover:bg-blue-600 transition-colors text-white px-2 py-1 rounded"
                  >
                    Chat
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum amigo encontrado.</p>
          )}
        </aside>
      </div>

      {/* Search Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-fit max-h-[90vh] flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-black">
              {searchType === "users"
                ? "Buscar Usuários"
                : "Buscar Chats Públicos"}
            </h3>

            {/* Controles de busca */}
            <div className="flex space-x-2 mb-4">
              <select
                value={searchType}
                onChange={(e) => {
                  const novo = e.target.value as "users" | "public";
                  setSearchType(novo);
                  setQuery("");
                  setUserResults([]);
                  setChatResults([]);
                }}
                className="text-black border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="users">Usuários</option>
                <option value="public">Chats Públicos</option>
              </select>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite para buscar…"
                className="text-black flex-1 border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-3 rounded"
              >
                Buscar
              </button>
            </div>

            {/* Resultados */}
            <div className="flex-1 overflow-hidden">
              {loadingSearch ? (
                <p className="text-center py-4">Carregando resultados…</p>
              ) : searchType === "users" ? (
                userResults.length > 0 ? (
                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {userResults.map((u) => (
                      <li
                        key={u._id}
                        className="flex justify-between items-center bg-gray-100 hover:bg-gray-200 transition-colors px-3 py-2 rounded"
                      >
                        <span className="truncate mr-2 text-black">
                          {u.first_name} {u.last_name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCreateChat(u._id, u.first_name, u.last_name)
                          }
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm whitespace-nowrap"
                        >
                          Adicionar
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : query.trim() ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum usuário encontrado.
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Digite sua busca acima.
                  </p>
                )
              ) : chatResults.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {chatResults.map((c) => (
                    <li
                      key={c._id}
                      className="flex justify-between items-center bg-gray-100 hover:bg-gray-200 transition-colors px-3 py-2 rounded"
                    >
                      <span className="truncate mr-2 text-black">{c.name}</span>
                      <button
                        type="button"
                        onClick={() => handleJoinPublicChat(c._id)}
                        className="bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap"
                      >
                        Entrar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : query.trim() ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum chat público encontrado.
                </p>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Digite sua busca acima.
                </p>
              )}
            </div>

            {/* Botão Fechar */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 transition-colors text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Public Chat Modal */}
      {isCreatePublicModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-black">
              Criar Chat Público
            </h3>
            <form onSubmit={handleCreatePublicChat}>
              <div className="mb-4">
                <label
                  htmlFor="chatName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nome do Chat*
                </label>
                <input
                  id="chatName"
                  type="text"
                  value={publicChatName}
                  onChange={(e) => setPublicChatName(e.target.value)}
                  placeholder="Digite o nome do chat"
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePublicModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  disabled={!publicChatName.trim()}
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

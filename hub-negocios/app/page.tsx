'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase'; 
import Navbar from '../components/Navbar';

export default function GlobalFeedPage() {
  const router = useRouter();
  
  // ================= ESTADOS =================
  // Estados do Feed Global
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Criar Nova Postagem
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);

  // Estados para os Comentários
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({}); 

  // ================= FUNÇÕES DE BUSCA =================
  // 1. BUSCA TODOS OS POSTS DO BANCO
  const fetchGlobalPosts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, content, file, created_at,
          profiles (username, location),
          likes (user_id),
          comments (
            id,
            content,
            created_at,
            profiles (username)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const postsComCurtidas = data.map((post: any) => ({
          ...post,
          likesCount: post.likes.length,
          isLikedByMe: post.likes.some((like: any) => like.user_id === session.user.id)
        }));
        
        setPosts(postsComCurtidas);
      }
    } catch (error: any) {
      console.error("Erro ao carregar o feed:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalPosts();
  }, []);

  // ================= FUNÇÕES DE AÇÃO =================
  // 2. CRIA UMA NOVA POSTAGEM
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !selectedImage) return;

    setPosting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let uploadedImageUrl = null;

      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images') 
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        uploadedImageUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: session.user.id,
          content: newPostContent,
          file: uploadedImageUrl 
        });

      if (insertError) throw insertError;

      setNewPostContent('');
      setSelectedImage(null);
      await fetchGlobalPosts();
      
    } catch (error: any) {
      alert('Erro ao publicar: ' + error.message);
    } finally {
      setPosting(false);
    }
  };

  // 3. DAR/TIRAR CURTIDA
  const handleToggleLike = async (postId: string, isLikedByMe: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLikedByMe: !isLikedByMe, 
            likesCount: isLikedByMe ? post.likesCount - 1 : post.likesCount + 1 
          } 
        : post
    ));

    try {
      if (isLikedByMe) {
        await supabase.from('likes').delete().match({ post_id: postId, user_id: session.user.id });
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: session.user.id });
      }
    } catch (error) {
      console.error("Erro ao curtir:", error);
      fetchGlobalPosts(); 
    }
  };

  // 4. ADICIONAR COMENTÁRIO
  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: session.user.id,
          content: text.trim()
        });

      if (error) throw error;

      setCommentInputs({ ...commentInputs, [postId]: '' });
      await fetchGlobalPosts();

    } catch (error: any) {
      alert("Erro ao enviar comentário: " + error.message);
    }
  };

  // 5. ABRIR/FECHAR ABA DE COMENTÁRIOS
  const toggleComments = (postId: string) => {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId]
    });
  };

  // ================= RENDERIZAÇÃO =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-primary font-semibold">Carregando Feed...</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        
        {/* COMPOSER: CAIXA DE NOVA POSTAGEM */}
        <div className="bg-surface-white border border-border-subtle rounded-lg p-5 shadow-sm">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-variant flex-shrink-0 flex items-center justify-center border border-border-subtle">
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              </div>
              
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Começar uma publicação..."
                  rows={2}
                  className="w-full border border-border-subtle rounded-lg p-3 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            {selectedImage && (
              <div className="relative inline-block mt-2 ml-13">
                <img 
                  src={URL.createObjectURL(selectedImage)} 
                  alt="Preview" 
                  className="max-h-48 rounded-lg object-cover border border-border-subtle"
                />
                <button 
                  type="button" 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs border-none cursor-pointer"
                >
                  X
                </button>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <label className="flex items-center gap-2 text-sm text-on-surface-variant font-medium cursor-pointer hover:text-primary transition-colors ml-13">
                <span className="material-symbols-outlined text-lg">image</span>
                <span>Mídia</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => e.target.files && setSelectedImage(e.target.files[0])}
                />
              </label>

              <button 
                type="submit" 
                disabled={posting || (!newPostContent.trim() && !selectedImage)}
                className="px-6 py-2 bg-primary text-surface-white font-semibold text-sm rounded-full border-none cursor-pointer hover:bg-opacity-90 disabled:opacity-50 transition-all"
              >
                {posting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </form>
        </div>

        {/* FEED: LISTA DE POSTAGENS */}
        <div className="space-y-5 pt-2">
          {posts.length === 0 ? (
            <div className="bg-surface-white border border-border-subtle rounded-lg p-8 text-center shadow-sm">
              <p className="text-on-surface-variant">O feed está vazio. Seja o primeiro a publicar algo!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="bg-surface-white border border-border-subtle rounded-lg p-5 shadow-sm space-y-3">
                
                {/* Cabeçalho do Post */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center border border-border-subtle flex-shrink-0">
                    <span className="material-symbols-outlined text-2xl text-on-surface-variant">person</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-on-surface">
                      {post.profiles?.username ? `@${post.profiles.username}` : 'Usuário Anônimo'}
                    </h4>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                      {post.profiles?.location && (
                        <>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                          {post.profiles.location} • 
                        </>
                      )}
                      {new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Texto e Imagem */}
                <p className="text-sm text-on-surface whitespace-pre-line leading-relaxed">
                  {post.content}
                </p>

                {post.file && (
                  <div className="rounded-lg overflow-hidden border border-border-subtle max-h-[500px] bg-surface-container-low mt-3 flex justify-center">
                    <img 
                      src={post.file} 
                      alt="Anexo da publicação" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                )}
                
                {/* Barra de Engajamento */}
                <div className="flex items-center gap-6 pt-3 mt-3 border-t border-border-subtle text-on-surface-variant">
                  <button 
                    onClick={() => handleToggleLike(post.id, post.isLikedByMe)}
                    className={`flex items-center gap-1 text-xs font-medium transition-colors bg-transparent border-none cursor-pointer ${
                      post.isLikedByMe ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <span 
                      className={post.isLikedByMe ? "material-symbols-rounded fill-current" : "material-symbols-outlined"} 
                      style={{ fontSize: '18px', fontVariationSettings: post.isLikedByMe ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      thumb_up
                    </span>
                    {post.likesCount > 0 ? `${post.likesCount} Gostei` : 'Gostei'}
                  </button>
                  
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1 text-xs font-medium text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat_bubble</span>
                    {post.comments?.length > 0 ? `${post.comments.length} Comentários` : 'Comentar'}
                  </button>
                </div>

                {/* ÁREA DE COMENTÁRIOS (Expansível) */}
                {expandedComments[post.id] && (
                  <div className="pt-4 mt-2 border-t border-border-subtle space-y-4">
                    
                    {/* Input de Novo Comentário */}
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-surface-variant flex-shrink-0 flex items-center justify-center border border-border-subtle">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input 
                          type="text"
                          placeholder="Adicione um comentário..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          className="flex-1 bg-surface-container-low border border-border-subtle text-sm px-3 py-1.5 rounded-full focus:outline-none focus:border-primary"
                        />
                        <button 
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim()}
                          className="text-primary font-bold text-sm bg-transparent border-none cursor-pointer disabled:opacity-50"
                        >
                          Enviar
                        </button>
                      </div>
                    </div>

                    {/* Lista de Comentários do Post */}
                    <div className="space-y-3 pl-10">
                      {post.comments?.map((comment: any) => (
                        <div key={comment.id} className="bg-surface-container-low p-2.5 rounded-lg border border-border-subtle">
                          <h5 className="text-xs font-bold text-on-surface">
                            {comment.profiles?.username ? `@${comment.profiles.username}` : 'Anônimo'}
                          </h5>
                          <p className="text-sm text-on-surface mt-1">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                    
                  </div>
                )}

              </article>
            ))
          )}
        </div>
        
      </main>
    </div>
  );
}
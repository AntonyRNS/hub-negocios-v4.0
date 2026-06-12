'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Profession {
  id: string;
  name: string;
  description?: string;
}


const DEFAULT_PROFESSIONS: Profession[] = [
  { id: 'prof-1', name: 'Carpinteiro', description: 'Trabalhos em madeira estrutural e fina.' },
  { id: 'prof-2', name: 'Desenvolvedor Fullstack', description: 'Criação de aplicações web de ponta a ponta.' },
  { id: 'prof-3', name: 'Eletricista', description: 'Instalações elétricas residenciais e comerciais.' },
  { id: 'prof-4', name: 'Encanador', description: 'Reparos hidráulicos e encanamentos gerais.' },
  { id: 'prof-5', name: 'Pintor', description: 'Pintura residencial interna e externa.' },
];

export default function ProfissoesPage() {
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchProfessions();
  }, []);

  const fetchProfessions = async () => {
    setFetching(true);
    try {
      const response = await fetch('/api/professions');
      if (response.ok) {
        const data = await response.json();
        setProfessions(data);
      } else {
        console.error('Erro ao buscar profissões da API');
      }
    } catch (error) {
      console.error('Erro na requisição de profissões:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setLoading(true);

    try {
      const response = await fetch('/api/professions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDesc.trim() || undefined,
        }),
      });

      if (response.ok) {
        const newProf = await response.json();
        
        // Verifica se a profissão já existia na lista atual pelo ID
        const alreadyExists = professions.some(p => p.id === newProf.id);
        
        let updated: Profession[];
        if (alreadyExists) {
          updated = [...professions];
        } else {
          updated = [...professions, newProf];
        }

        // Ordena alfabeticamente
        updated.sort((a, b) => a.name.localeCompare(b.name));
        setProfessions(updated);
        setNewName('');
        setNewDesc('');
      } else {
        const errData = await response.json();
        alert(errData.error || 'Erro ao adicionar profissão.');
      }
    } catch (error) {
      console.error('Erro ao adicionar profissão:', error);
      alert('Erro de conexão ao adicionar profissão.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta profissão? Isso pode afetar prestadores cadastrados.')) return;
    
    try {
      const response = await fetch(`/api/professions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProfessions(prev => prev.filter(p => p.id !== id));
      } else {
        const errData = await response.json();
        alert(errData.error || 'Erro ao excluir profissão.');
      }
    } catch (error) {
      console.error('Erro ao excluir profissão:', error);
      alert('Erro de conexão ao excluir profissão.');
    }
  };


  return (
    <div className="container py-5" style={{ maxWidth: '960px' }}>
      
      {/* Título Principal */}
      <div className="mb-5 border-bottom border-4 border-dark pb-3">
        <h1 className="fw-black text-uppercase m-0 display-6" style={{ letterSpacing: '-1px' }}>
          Gestão de Profissões
        </h1>
        <p className="text-secondary text-uppercase small fw-bold tracking-wider m-0 mt-1">
          Gerencie as categorias de serviços do sistema
        </p>
      </div>

      {/* Grid de Conteúdo */}
      <div className="row g-5">
        
        {/* Coluna da Esquerda: Formulário de Cadastro */}
        <div className="col-12 col-lg-4">
          <h2 className="small fw-bold text-uppercase tracking-wider mb-4">Nova Categoria</h2>
          
          <form onSubmit={handleAdd}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-muted" style={{ fontSize: '10px' }}>
                Nome da Profissão
              </label>
              <input 
                required
                className="form-control border-2 border-dark rounded-0 shadow-none p-3 text-uppercase fw-bold"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-muted" style={{ fontSize: '10px' }}>
                Descrição (Opcional)
              </label>
              <textarea 
                className="form-control border-2 border-dark rounded-0 shadow-none p-3 fw-bold"
                rows={3}
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
              />
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="btn btn-dark rounded-0 w-100 py-3 text-uppercase fw-bold tracking-widest d-flex align-items-center justify-content-center"
              style={{ fontSize: '12px' }}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <>
                  <Plus size={16} className="me-2" />
                  ADICIONAR
                </>
              )}
            </button>
          </form>
        </div>

        {/* Coluna da Direita: Listagem das Profissões */}
        <div className="col-12 col-lg-8">
          <h2 className="small fw-bold text-uppercase tracking-wider mb-4">
            Categorias Atuais ({professions.length})
          </h2>
          
          {fetching ? (
            <div className="text-center py-5 text-muted text-uppercase fw-bold opacity-70" style={{ fontSize: '10px', letterSpacing: '1px' }}>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Carregando...
            </div>
          ) : (
            <div className="border border-2 border-dark rounded-0 bg-white">
              {professions.length > 0 ? (
                professions.map((p, index) => (
                  <div 
                    key={p.id} 
                    className={`p-3 d-flex justify-content-between align-items-center ${
                      index !== professions.length - 1 ? 'border-bottom border-dark' : ''
                    }`}
                    style={{ transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <div>
                      <h3 className="h6 text-uppercase fw-bold m-0 tracking-tight">{p.name}</h3>
                      {p.description && <p className="text-secondary small m-0 mt-1">{p.description}</p>}
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="btn btn-link text-muted p-2 p-0 text-decoration-none"
                      style={{ transition: 'color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#000'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#6c757d'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-5 text-center text-muted text-uppercase fw-bold tracking-wider" style={{ fontSize: '10px' }}>
                  Nenhuma profissão cadastrada
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
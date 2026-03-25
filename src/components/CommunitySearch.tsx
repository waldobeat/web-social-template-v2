import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useAppContext } from '../context/useAppContext';
import './CommunitySearch.css';

export const CommunitySearch = () => {
    const { communities, currentUser, joinCommunity, leaveCommunity } = useAppContext();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const allCommunities = Object.values(communities);

    const filteredCommunities = searchTerm.trim()
        ? allCommunities.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const showResults = searchTerm.trim() && isFocused;

    return (
        <div className="community-search-container">
            <div className={`search-input-wrapper ${isFocused ? 'focused' : ''}`}>
                <Search size={16} className="search-icon" />
                <input
                    type="text"
                    placeholder="Buscar comunidades..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    className="community-search-input"
                />
                {searchTerm && (
                    <button
                        className="clear-search-btn"
                        onClick={() => setSearchTerm('')}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {showResults && (
                <div className="search-results-dropdown">
                    {filteredCommunities.length > 0 ? (
                        <>
                            <div className="results-header">
                                {filteredCommunities.length} resultado{filteredCommunities.length !== 1 ? 's' : ''}
                            </div>
                            {filteredCommunities.slice(0, 5).map(c => {
                                const isJoined = currentUser?.joinedCommunityIds.includes(c.id);
                                return (
                                    <div
                                        key={c.id}
                                        className="search-result-item"
                                        onClick={() => navigate(`/community/${c.id}`)}
                                    >
                                        <div className="result-color-dot" style={{ backgroundColor: c.colorTheme }} />
                                        <div className="result-info">
                                            <span className="result-name">{c.name}</span>
                                            <span className="result-members">{c.memberCount} miembros</span>
                                        </div>
                                        <button
                                            className={`btn-join-small ${isJoined ? 'joined' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                isJoined ? leaveCommunity(c.id) : joinCommunity(c.id);
                                            }}
                                        >
                                            {isJoined ? 'Unido' : 'Unirse'}
                                        </button>
                                    </div>
                                );
                            })}
                            {filteredCommunities.length > 5 && (
                                <div className="more-results">
                                    y {filteredCommunities.length - 5} más...
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-results">
                            <p>No se encontraron comunidades</p>
                            <span>Intenta con otro término</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

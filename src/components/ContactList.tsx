import React, { useState, useMemo } from 'react';
import type { Client } from '../../types';
import { ContactsMap } from './ContactsMap';
import { findNearbyPlaces } from '../services/geminiService';
import { Modal } from './Modal';
import { PlusIcon, MailIcon, PhoneIcon, LocationMarkerIcon, SearchLocationIcon } from './icons';

interface ContactListProps {
  clients: Client[];
  onAddContact: () => void;
}

const ContactCard: React.FC<{ 
    client: Client;
    isSelected: boolean;
    onSelect: (id: string) => void;
}> = ({ client, isSelected, onSelect }) => {
    const cardClasses = `bg-white dark:bg-slate-800 rounded-lg shadow-md border p-6 hover:shadow-xl transition-all transform hover:scale-[1.02] cursor-pointer group ${isSelected ? 'border-rose-500 dark:border-rose-400 shadow-xl scale-[1.02]' : 'border-gray-200 dark:border-slate-700'}`;
    
    return (
        <div 
            className={cardClasses}
            onClick={() => onSelect(client.id)}
        >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate w-full group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{client.name}</h3>
            <p className="text-sm text-rose-600 dark:text-rose-400 font-medium mb-3">{client.contactPerson}</p>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 flex-grow">
                <div className="flex items-center gap-2">
                    <MailIcon />
                    <a href={`mailto:${client.email}`} className="text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 truncate">{client.email}</a>
                </div>
                <div className="flex items-center gap-2">
                    <PhoneIcon />
                    <span className="text-gray-600 dark:text-gray-400">{client.phone}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <LocationMarkerIcon />
                    <span className="text-gray-600 dark:text-gray-400">{client.location}</span>
                </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Added: {new Date(client.createdAt).toLocaleDateString()}</p>
        </div>
    );
};

const AddContactCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button 
        onClick={onClick}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-md border-2 border-dashed border-gray-300 dark:border-slate-600 p-6 hover:border-rose-500 dark:hover:border-rose-400 hover:shadow-xl transition-all transform hover:scale-[1.02] text-center flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 group"
    >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PlusIcon className="text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400">Add Contact</h3>
    </button>
);


export const ContactList: React.FC<ContactListProps> = ({ clients, onAddContact }) => {
    const [sortBy, setSortBy] = useState('alphabetical');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [isFinderOpen, setIsFinderOpen] = useState(false);
    const [finderQuery, setFinderQuery] = useState('non-profit organizations');
    const [finderResult, setFinderResult] = useState<{ text: string, sources: any[] } | null>(null);
    const [isFinding, setIsFinding] = useState(false);

    const handleSelectClient = (clientId: string) => {
        // Toggle selection
        setSelectedClientId(prevId => (prevId === clientId ? null : clientId));
    };

    const handleFindNearby = () => {
        setIsFinding(true);
        setFinderResult(null);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const result = await findNearbyPlaces(latitude, longitude, finderQuery);
                setFinderResult(result);
                setIsFinding(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                setFinderResult({ text: `Could not get your location: ${error.message}`, sources: [] });
                setIsFinding(false);
            }
        );
    };


    const sortedClients = useMemo(() => {
        const sorted = [...clients];
        switch (sortBy) {
            case 'date-newest':
                return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case 'date-oldest':
                return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            case 'location':
                return sorted.sort((a, b) => a.location.localeCompare(b.location));
            case 'alphabetical':
            default:
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
        }
    }, [clients, sortBy]);

  return (
    <div className="space-y-8">
      <Modal isOpen={isFinderOpen} onClose={() => setIsFinderOpen(false)} title="Find Nearby Places">
          <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Find potential partners or resources near your current location using Google Maps.</p>
              <div>
                <label htmlFor="finder-query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search for:</label>
                <input
                    id="finder-query"
                    type="text"
                    value={finderQuery}
                    onChange={(e) => setFinderQuery(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md dark:text-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <button onClick={handleFindNearby} disabled={isFinding} className="w-full flex justify-center items-center gap-2 bg-rose-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-rose-600 disabled:bg-rose-300 transition-colors">
                  {isFinding ? 'Searching...' : 'Find Places'}
              </button>
              {finderResult && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-md max-h-64 overflow-y-auto">
                      <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">{finderResult.text}</p>
                      {finderResult.sources.length > 0 && (
                          <div className="mt-4 pt-2 border-t border-gray-200 dark:border-slate-600">
                              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">Sources:</h4>
                              <ul className="text-xs mt-1 space-y-1">
                                  {finderResult.sources.map((source, index) => source.maps && (
                                      <li key={index}>
                                          <a href={source.maps.uri} target="_blank" rel="noopener noreferrer" className="text-rose-600 dark:text-rose-400 hover:underline">
                                              {source.maps.title}
                                          </a>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      )}
                  </div>
              )}
          </div>
      </Modal>

      <ContactsMap 
        clients={clients} 
        selectedClientId={selectedClientId}
        onSelect={handleSelectClient}
      />
      
      <div>
        <div id="contacts-header" className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Contacts</h2>
            <div id="contacts-actions" className="flex items-center gap-2">
                 <button id="contacts-find-nearby" onClick={() => setIsFinderOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 transition-colors">
                    <SearchLocationIcon />
                    Find Nearby
                </button>
                <select
                id="contacts-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                <option value="alphabetical">Alphabetical (A-Z)</option>
                <option value="date-newest">Date Added (Newest)</option>
                <option value="date-oldest">Date Added (Oldest)</option>
                <option value="location">Location (A-Z)</option>
                </select>
            </div>
        </div>
        <div id="contacts-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedClients.map((client, index) => (
            <div key={client.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
              <ContactCard 
                client={client}
                isSelected={client.id === selectedClientId}
                onSelect={handleSelectClient}
              />
            </div>
            ))}
            <div className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${sortedClients.length * 50}ms` }}>
              <AddContactCard onClick={onAddContact} />
            </div>
        </div>
      </div>
    </div>
  );
};

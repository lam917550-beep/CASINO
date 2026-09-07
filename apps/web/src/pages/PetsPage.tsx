import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function PetsPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ownedPets, setOwnedPets] = useState<any[]>([]);

  useEffect(() => {
    fetchPets();
    fetchOwnedPets();
  }, [page]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pets', { params: { page, limit: 20 } });
      setPets(res.data.pets);
      setTotal(res.data.total);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnedPets = async () => {
    try {
      const res = await api.get('/pets/mine');
      setOwnedPets(res.data.pets);
    } catch (err) {}
  };

  const buyPet = async (petId: string) => {
    try {
      await api.post(`/pets/${petId}/buy`);
      fetchOwnedPets();
    } catch (err) {
      alert('Failed to buy pet');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pets</h1>

      {/* Owned pets */}
      <h2 className="font-semibold text-lg mb-2">My Pets ({ownedPets.length})</h2>
      {ownedPets.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {ownedPets.map((userPet) => (
            <div key={userPet.id} className="bg-dark-800 rounded-xl p-3 text-center border border-dark-700 min-w-[100px]">
              <div className="text-3xl">🐾</div>
              <p className="text-xs">{userPet.pet.name}</p>
              <p className="text-xs text-gray-400">Lv {userPet.level}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm mb-4">No pets yet. Buy one below!</p>
      )}

      {/* Available pets */}
      <h2 className="font-semibold text-lg mb-2">Shop Pets</h2>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-dark-800 rounded-xl p-4 border border-dark-700">
              <div className="text-3xl mb-2">🐾</div>
              <p className="font-medium text-sm">{pet.name}</p>
              <p className="text-xs text-gray-400">{pet.rarity}</p>
              <p className="text-xs text-gold mt-1">🪙 {pet.price.toLocaleString()}</p>
              <button
                onClick={() => buyPet(pet.id)}
                className="mt-2 w-full py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg"
              >
                Buy
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 bg-dark-800 rounded-lg disabled:opacity-50">Prev</button>
        <span className="px-4 py-2 text-sm text-gray-400">Page {page}</span>
        <button disabled={pets.length < 20} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 bg-dark-800 rounded-lg disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}

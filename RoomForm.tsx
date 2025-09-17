import React, { useState } from 'react';
import { Plus, Trash2, Building } from 'lucide-react';
import { Room } from '../types';

interface RoomFormProps {
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
}

const RoomForm: React.FC<RoomFormProps> = ({ rooms, setRooms }) => {
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    name: '',
    capacity: 30,
    type: 'classroom',
    equipment: []
  });

  const [equipmentInput, setEquipmentInput] = useState('');

  const roomTypes = [
    { value: 'classroom', label: 'Classroom' },
    { value: 'lab', label: 'Laboratory' },
    { value: 'auditorium', label: 'Auditorium' }
  ];

  const addEquipment = () => {
    if (equipmentInput.trim()) {
      setNewRoom({
        ...newRoom,
        equipment: [...(newRoom.equipment || []), equipmentInput.trim()]
      });
      setEquipmentInput('');
    }
  };

  const removeEquipment = (index: number) => {
    const updated = [...(newRoom.equipment || [])];
    updated.splice(index, 1);
    setNewRoom({ ...newRoom, equipment: updated });
  };

  const addRoom = () => {
    if (!newRoom.name) return;

    const room: Room = {
      id: Date.now().toString(),
      name: newRoom.name,
      capacity: newRoom.capacity || 30,
      type: newRoom.type as 'classroom' | 'lab' | 'auditorium',
      equipment: newRoom.equipment || []
    };

    setRooms([...rooms, room]);
    setNewRoom({
      name: '',
      capacity: 30,
      type: 'classroom',
      equipment: []
    });
  };

  const removeRoom = (id: string) => {
    setRooms(rooms.filter(room => room.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Building className="w-5 h-5 mr-2 text-purple-600" />
          Add New Room
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Name
            </label>
            <input
              type="text"
              value={newRoom.name || ''}
              onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Room 101, CS Lab A"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity
            </label>
            <input
              type="number"
              value={newRoom.capacity || 30}
              onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="1"
              max="500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type
            </label>
            <select
              value={newRoom.type || 'classroom'}
              onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {roomTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Equipment
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={equipmentInput}
              onChange={(e) => setEquipmentInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Projector, Whiteboard, Computers"
              onKeyPress={(e) => e.key === 'Enter' && addEquipment()}
            />
            <button
              onClick={addEquipment}
              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              Add
            </button>
          </div>
          
          {newRoom.equipment && newRoom.equipment.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {newRoom.equipment.map((equipment, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  {equipment}
                  <button
                    onClick={() => removeEquipment(index)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={addRoom}
          disabled={!newRoom.name}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </button>
      </div>

      {rooms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Added Rooms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{room.name}</h4>
                    <p className="text-sm text-gray-600">
                      {room.type.charAt(0).toUpperCase() + room.type.slice(1)} • Capacity: {room.capacity}
                    </p>
                    {room.equipment.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Equipment:</p>
                        <div className="flex flex-wrap gap-1">
                          {room.equipment.map((equipment, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {equipment}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeRoom(room.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomForm;
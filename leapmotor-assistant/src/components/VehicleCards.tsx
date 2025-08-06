import { motion } from 'framer-motion';
import { Battery, Zap, Car, ChevronRight } from 'lucide-react';
import vehiclesData from '../data/vehicles.json';
import type { Vehicle } from '../types';

interface VehicleCardsProps {
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const VehicleCards: React.FC<VehicleCardsProps> = ({ onSelectVehicle }) => {
  const vehicles = vehiclesData.vehicles as Vehicle[];

  return (
    <div className="w-full">
      <div className="space-y-3">
        {vehicles.map((vehicle, index) => (
          <div
            key={vehicle.id}
            className="bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer group border border-gray-700 hover:border-leap-green-500/30 transition-all hover:scale-105"
            onClick={() => onSelectVehicle(vehicle)}
          >
            <div className="flex">
              {/* Vehicle Image - Menor */}
              <div className="relative w-24 h-20 bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden flex-shrink-0">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Vehicle Info - Compacto */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">{vehicle.name}</h4>
                  <p className="text-gray-400 text-xs mb-2">{vehicle.type}</p>
                </div>

                {/* Key Specs - Inline */}
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Battery className="w-3 h-3 text-leap-green-500" />
                    {vehicle.autonomy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-leap-green-500" />
                    {vehicle.power}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-leap-green-500 font-bold">{vehicle.price}</p>
                  </div>
                  <div className="text-leap-green-400 group-hover:text-leap-green-300">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

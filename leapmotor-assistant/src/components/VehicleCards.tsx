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
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Nossos Veículos</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group"
            onClick={() => onSelectVehicle(vehicle)}
          >
            {/* Vehicle Image */}
            <div className="relative h-48 bg-gradient-to-br from-leap-green-100 to-leap-green-200 overflow-hidden">
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4 bg-leap-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {vehicle.name}
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-2">{vehicle.name}</h4>
              <p className="text-gray-600 text-sm mb-4">{vehicle.type}</p>

              {/* Key Specs */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Battery className="w-4 h-4 text-leap-green-500" />
                  <span className="text-sm">Autonomia: {vehicle.autonomy}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Zap className="w-4 h-4 text-leap-green-500" />
                  <span className="text-sm">Potência: {vehicle.power}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Car className="w-4 h-4 text-leap-green-500" />
                  <span className="text-sm">{vehicle.acceleration}</span>
                </div>
              </div>

              {/* Price */}
              <div className="border-t pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">A partir de</p>
                  <p className="text-2xl font-bold text-leap-green-600">{vehicle.price}</p>
                </div>
                <motion.button
                  whileHover={{ x: 5 }}
                  className="bg-leap-green-500 text-white p-3 rounded-full group-hover:bg-leap-green-600 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
import React from 'react';
import { cn } from '@/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Building2, MapPin } from 'lucide-react';
import type { Branch } from '@/types';

export const BranchSelectionModal: React.FC = () => {
  const availableBranches = useAuthStore((state) => state.availableBranches);
  const selectBranch = useAuthStore((state) => state.selectBranch);
  const hospital = useAuthStore((state) => state.hospital);

  const handleSelectBranch = (branch: Branch) => {
    selectBranch(branch);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Building2 size={32} className="text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-white">Select Branch</h2>
          <p className="text-teal-100 text-sm mt-1">
            Choose which branch you want to work in today
          </p>
        </div>

        {/* Hospital Info */}
        {hospital && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                {hospital.logoUrl ? (
                  <img
                    src={hospital.logoUrl}
                    alt={hospital.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  '🏥'
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{hospital.name}</p>
                <p className="text-xs text-gray-500">{availableBranches.length} branches available</p>
              </div>
            </div>
          </div>
        )}

        {/* Branch List */}
        <div className="p-4 max-h-[300px] overflow-y-auto">
          <div className="space-y-2">
            {availableBranches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => handleSelectBranch(branch)}
                className={cn(
                  'w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:shadow-md',
                  'border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {branch.code || branch.name[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{branch.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={12} />
                      <span>{branch.city}, {branch.state}</span>
                    </div>
                    {branch.isHeadquarters && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full">
                        Headquarters
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {/* Will show check when selected */}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            You can switch branches anytime from the header menu
          </p>
        </div>
      </div>
    </div>
  );
};

export default BranchSelectionModal;

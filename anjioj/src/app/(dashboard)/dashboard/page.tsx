import { 
  UserGroupIcon, 
  PhotoIcon, 
  DocumentTextIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline'

const stats = [
  { name: 'Total Patients', value: '2,453', icon: UserGroupIcon, change: '+12%', changeType: 'positive' },
  { name: 'Examens du jour', value: '8', icon: CalendarIcon, change: '+2', changeType: 'positive' },
  { name: 'Images traitées', value: '342', icon: PhotoIcon, change: '+28%', changeType: 'positive' },
  { name: 'Rapports générés', value: '56', icon: DocumentTextIcon, change: '+15%', changeType: 'positive' },
]

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-600">
          Vue d'ensemble de votre activité
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{stat.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Examens récents</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-900">Jean Durand</p>
                <p className="text-sm text-gray-500">Angiographie - Il y a 2 heures</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                Terminé
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-900">Sophie Martin</p>
                <p className="text-sm text-gray-500">Rétinographie - Il y a 3 heures</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                En cours
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-900">Pierre Petit</p>
                <p className="text-sm text-gray-500">OCT - Prévu à 14h00</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                Planifié
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 text-indigo-600 mr-3" />
                <span className="font-medium text-indigo-900">Nouveau patient</span>
              </div>
              <span className="text-indigo-600">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium text-green-900">Planifier un examen</span>
              </div>
              <span className="text-green-600">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <PhotoIcon className="h-5 w-5 text-purple-600 mr-3" />
                <span className="font-medium text-purple-900">Importer des images</span>
              </div>
              <span className="text-purple-600">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
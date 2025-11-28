import { NetworkOptions } from "./NetworkOptions";
import { useDisconnect } from "wagmi";
import { ArrowLeftOnRectangleIcon, ChevronDownIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl cursor-pointer hover:bg-red-500/30 transition-colors">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Wrong Network</span>
        <ChevronDownIcon className="h-4 w-4" />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu z-50 p-2 mt-3 bg-[#12121a] border border-white/10 rounded-xl shadow-2xl shadow-black/50 min-w-[180px]"
      >
        <NetworkOptions />
        <li className="border-t border-white/10 mt-1 pt-1">
          <button
            className="flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors w-full"
            type="button"
            onClick={() => disconnect()}
          >
            <ArrowLeftOnRectangleIcon className="h-4 w-4" />
            <span className="text-sm">Disconnect</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

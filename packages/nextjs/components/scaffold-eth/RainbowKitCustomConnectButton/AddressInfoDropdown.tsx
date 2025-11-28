import { useRef, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import { getAddress } from "viem";
import { Address } from "viem";
import { useAccount, useDisconnect } from "wagmi";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { BlockieAvatar, isENS } from "~~/components/scaffold-eth";
import { useCopyToClipboard, useOutsideClick } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const BURNER_WALLET_ID = "burnerWallet";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const { connector } = useAccount();
  const checkSumAddress = getAddress(address);

  const { copyToClipboard: copyAddressToClipboard, isCopiedToClipboard: isAddressCopiedToClipboard } =
    useCopyToClipboard();
  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };

  useOutsideClick(dropdownRef, closeDropdown);

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
        <summary className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 rounded-xl cursor-pointer transition-all duration-200 shadow-lg shadow-emerald-500/20">
          <BlockieAvatar address={checkSumAddress} size={24} ensImage={ensAvatar} />
          <span className="text-white font-medium text-sm hidden sm:block">
            {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
          </span>
          <ChevronDownIcon className="h-4 w-4 text-white/80" />
        </summary>
        <ul className="dropdown-content menu z-50 p-2 mt-3 bg-[#12121a] border border-white/10 rounded-xl shadow-2xl shadow-black/50 min-w-[200px]">
          <NetworkOptions hidden={!selectingNetwork} />
          
          <li className={selectingNetwork ? "hidden" : ""}>
            <div
              className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
              onClick={() => copyAddressToClipboard(checkSumAddress)}
            >
              {isAddressCopiedToClipboard ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  <span className="text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="h-4 w-4" aria-hidden="true" />
                  <span className="text-sm">Copy address</span>
                </>
              )}
            </div>
          </li>
          
          <li className={selectingNetwork ? "hidden" : ""}>
            <label htmlFor="qrcode-modal" className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
              <QrCodeIcon className="h-4 w-4" />
              <span className="text-sm">View QR Code</span>
            </label>
          </li>
          
          <li className={selectingNetwork ? "hidden" : ""}>
            <a
              target="_blank"
              href={blockExplorerAddressLink}
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              <span className="text-sm">Block Explorer</span>
            </a>
          </li>
          
          {allowedNetworks.length > 1 ? (
            <li className={selectingNetwork ? "hidden" : ""}>
              <button
                className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors w-full"
                type="button"
                onClick={() => setSelectingNetwork(true)}
              >
                <ArrowsRightLeftIcon className="h-4 w-4" />
                <span className="text-sm">Switch Network</span>
              </button>
            </li>
          ) : null}
          
          {connector?.id === BURNER_WALLET_ID ? (
            <li>
              <label htmlFor="reveal-burner-pk-modal" className="flex items-center gap-3 px-3 py-2.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg cursor-pointer transition-colors">
                <EyeIcon className="h-4 w-4" />
                <span className="text-sm">Reveal Private Key</span>
              </label>
            </li>
          ) : null}
          
          <li className={`${selectingNetwork ? "hidden" : ""} border-t border-white/10 mt-1 pt-1`}>
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
      </details>
    </>
  );
};

import { Home, Settings, HelpCircle, Store, BookOpen } from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useSidebar } from "@/components/ui/sidebar"; // import useSidebar hook
import { useEffect, useState, useRef } from "react";
import type { ComponentType } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { dropdownOpenAtom } from "@/atoms/uiAtoms";
import { selectedAppIdAtom } from "@/atoms/appAtoms";
import { selectedChatIdAtom } from "@/atoms/chatAtoms";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ChatList } from "./ChatList";
import { AppList } from "./AppList";
import { HelpDialog } from "./HelpDialog"; // Import the new dialog
import { SettingsList } from "./SettingsList";
import { LibraryList } from "./LibraryList";
import {
  type AppSidebarHoverState,
  type AppSidebarItemTitle,
  getSelectedSidebarPanel,
  isSidebarItemActive,
  shouldShowSelectedAppChatList,
} from "./app-sidebar-state";

// Menu items.
const items = [
  {
    title: "Apps",
    to: "/",
    icon: Home,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: Settings,
  },
  {
    title: "Library",
    to: "/library",
    icon: BookOpen,
  },
  {
    title: "Hub",
    to: "/hub",
    icon: Store,
  },
] satisfies Array<{
  title: AppSidebarItemTitle;
  to: string;
  icon: ComponentType<{ className?: string }>;
}>;

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar(); // retrieve current sidebar state
  const [hoverState, setHoverState] =
    useState<AppSidebarHoverState>("no-hover");
  const expandedByHover = useRef(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false); // State for dialog
  const [isDropdownOpen] = useAtom(dropdownOpenAtom);
  const selectedAppId = useAtomValue(selectedAppIdAtom);
  const setSelectedAppId = useSetAtom(selectedAppIdAtom);
  const setSelectedChatId = useSetAtom(selectedChatIdAtom);
  const navigate = useNavigate();

  useEffect(() => {
    if (hoverState.startsWith("start-hover") && state === "collapsed") {
      expandedByHover.current = true;
      toggleSidebar();
    }
    if (
      hoverState === "clear-hover" &&
      state === "expanded" &&
      expandedByHover.current &&
      !isDropdownOpen
    ) {
      toggleSidebar();
      expandedByHover.current = false;
      setHoverState("no-hover");
    }
  }, [hoverState, toggleSidebar, state, setHoverState, isDropdownOpen]);

  const routerState = useRouterState();
  const selectedItem = getSelectedSidebarPanel({
    hoverState,
    sidebarState: state,
    pathname: routerState.location.pathname,
  });
  const showSelectedAppChats = shouldShowSelectedAppChatList({
    selectedPanel: selectedItem,
    selectedAppId,
    isHoveringPanel: hoverState.startsWith("start-hover"),
  });

  const handleViewAllApps = () => {
    setSelectedAppId(null);
    setSelectedChatId(null);
    navigate({ to: "/" });
  };

  return (
    <Sidebar
      collapsible="icon"
      onMouseLeave={() => {
        if (!isDropdownOpen) {
          setHoverState("clear-hover");
        }
      }}
    >
      <SidebarContent className="overflow-hidden">
        <div className="flex mt-8">
          {/* Left Column: Menu items */}
          <div className="">
            <SidebarTrigger
              onMouseEnter={() => {
                setHoverState("clear-hover");
              }}
            />
            <AppIcons onHoverChange={setHoverState} />
          </div>
          {/* Right Column: Chat List Section */}
          <div className="w-[272px]">
            <AppList show={selectedItem === "Apps" && !showSelectedAppChats} />
            <ChatList
              show={showSelectedAppChats}
              showViewAllAppsButton
              onViewAllApps={handleViewAllApps}
            />
            <SettingsList show={selectedItem === "Settings"} />
            <LibraryList show={selectedItem === "Library"} />
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Change button to open dialog instead of linking */}
            <SidebarMenuButton
              size="sm"
              className="font-medium w-14 flex flex-col items-center gap-1 h-14 mb-2 rounded-2xl"
              onClick={() => setIsHelpDialogOpen(true)} // Open dialog on click
            >
              <HelpCircle className="h-5 w-5" />
              <span className={"text-xs"}>Help</span>
            </SidebarMenuButton>
            <HelpDialog
              isOpen={isHelpDialogOpen}
              onClose={() => setIsHelpDialogOpen(false)}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function AppIcons({
  onHoverChange,
}: {
  onHoverChange: (state: AppSidebarHoverState) => void;
}) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    // When collapsed: only show the main menu
    <SidebarGroup className="pr-0">
      {/* <SidebarGroupLabel>Dyad</SidebarGroupLabel> */}

      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = isSidebarItemActive({
              title: item.title,
              pathname,
            });

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  as={Link}
                  to={item.to}
                  size="sm"
                  className={`font-medium w-14 flex flex-col items-center gap-1 h-14 mb-2 rounded-2xl ${
                    isActive ? "bg-sidebar-accent" : ""
                  }`}
                  onMouseEnter={() => {
                    if (item.title === "Apps") {
                      onHoverChange("start-hover:app");
                    } else if (item.title === "Settings") {
                      onHoverChange("start-hover:settings");
                    } else if (item.title === "Library") {
                      onHoverChange("start-hover:library");
                    }
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <item.icon className="h-5 w-5" />
                    <span className={"text-xs"}>{item.title}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

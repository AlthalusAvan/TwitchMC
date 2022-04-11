import { Box, Button, Flex, Link, Stack, Text } from "@chakra-ui/react";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { Link as ReactLink } from "react-router-dom";
import { useFirebaseAuth } from "../providers/authProvider";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  function toggle() {
    console.log("bop");
    setIsOpen(!isOpen);
  }

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      py={4}
      px={8}
      bg={"purple.500"}
      color={"gray.100"}
      borderBottom="1px"
    >
      <Logo />
      <MenuToggle toggle={toggle} isOpen={isOpen} />
      <MenuLinks isOpen={isOpen} />
    </Flex>
  );
}

function Logo(props: any) {
  return (
    <Box {...props}>
      <Link as={ReactLink} to="/" _hover={{ textDecoration: "none" }}>
        <Text fontSize="lg" fontWeight="bold">
          TwitchMC
        </Text>
      </Link>
    </Box>
  );
}

interface MenuToggleProps {
  toggle: () => void;
  isOpen: boolean;
}

function MenuToggle({ toggle, isOpen }: MenuToggleProps) {
  return (
    <Box display={{ base: "block", md: "none" }} onClick={toggle}>
      {isOpen ? <CloseIcon /> : <HamburgerIcon />}
    </Box>
  );
}

interface MenuItemProps {
  children: React.ReactElement | string;
  isLast?: boolean;
  to: string;
  primaryColor?: boolean;
  [key: string]: any;
}

const MenuItem = ({
  children,
  isLast = false,
  to = "/",
  primaryColor = false,
  ...rest
}: MenuItemProps) => {
  return (
    <Link as={ReactLink} to={to}>
      <Button
        colorScheme={primaryColor ? "gray" : "purple"}
        color={primaryColor ? "purple.500" : "white"}
        size="sm"
      >
        {children}
      </Button>
    </Link>
  );
};

interface MenuLinksProps {
  isOpen: boolean;
}

const MenuLinks = ({ isOpen }: MenuLinksProps) => {
  const user = useFirebaseAuth();

  return (
    <Box
      display={{ base: isOpen ? "block" : "none", md: "block" }}
      flexBasis={{ base: "100%", md: "auto" }}
    >
      <Stack
        spacing={2}
        align="center"
        justify={["center", "space-between", "flex-end", "flex-end"]}
        direction={["column", "row", "row", "row"]}
        pt={[4, 4, 0, 0]}
      >
        <MenuItem to="/">Home</MenuItem>
        <MenuItem to="/about">About</MenuItem>
        {user && (
          <>
            <MenuItem to="/connect">Connect</MenuItem>
            <MenuItem to="/servers">Manage Servers</MenuItem>
          </>
        )}

        <MenuItem to={user ? "/logout" : "/login"} primaryColor>
          {user ? "Log Out" : "Log In"}
        </MenuItem>
      </Stack>
    </Box>
  );
};

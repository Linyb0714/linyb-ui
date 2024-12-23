import { makeInstaller } from "@linyb-ui/utils";
import components from "./components";
import "@linyb-ui/theme/index.css";

const installer = makeInstaller(components);

export * from "@linyb-ui/components";
export default installer;

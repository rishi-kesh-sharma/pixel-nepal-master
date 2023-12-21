import { createContext, useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import "@/styles/globals.css";
import "@/styles/reset.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/nprogress.css";

import axios from "axios";
import {
  getLogInStatus,
  getUserProfile,
  selectIsLoggedIn,
  selectUser,
} from "@/redux/slices/authSlice";
import { store } from "@/redux/store";
import wrapper from "@/redux/redux-wrapper";
import NProgress from "nprogress";
import { Router, useRouter } from "next/router";

axios.defaults.withCredentials = true;

export const appContext = createContext(null);

function App({ Component, pageProps }) {
  const [breadcrumbs, setBreadcrumbs] = useState();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);
  const router = useRouter();

  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);

  useEffect(() => {
    dispatch(getLogInStatus());
    if (isLoggedIn && user === null) {
      dispatch(getUserProfile());
    }
  }, [dispatch, isLoggedIn, user]);

  useEffect(() => {
    const pathWithoutQuery = router.asPath.split("?")[0];
    let pathArray = pathWithoutQuery.split("/");
    pathArray.shift();
    pathArray = pathArray.filter((path) => path !== "");
    const breadcrumbs = pathArray.map((path, index) => {
      const href = "/" + pathArray.slice(0, index + 1).join("/");
      return {
        href,
        label: path.charAt(0).toUpperCase() + path.slice(1),
        isCurrent: index === pathArray.length - 1,
      };
    });

    // set breadcrumb
    setBreadcrumbs(breadcrumbs);

    // nprogress on route start
    const handleRouteStart = () => {
      NProgress.start();
    };

    // nprogress on route done
    const handleRouteDone = () => {
      NProgress.done();
    };

    // capture route change start event
    Router.events.on("routeChangeStart", handleRouteStart);

    // capture route complete event
    Router.events.on("routeChangeComplete", handleRouteDone);

    // capture route change error event
    Router.events.on("routeChangeError", handleRouteDone);

    return () => {
      Router.events.off("routeChangeStart", handleRouteStart);
      Router.events.off("routeChangeComplete", handleRouteDone);
      Router.events.off("routeChangeError", handleRouteDone);
    };
  }, [router.asPath, router.query]);

  return (
    <Provider store={store}>
      <appContext.Provider value={breadcrumbs}>
        <ToastContainer />
        <Component {...pageProps} />
      </appContext.Provider>
    </Provider>
  );
}
export default wrapper.withRedux(App);

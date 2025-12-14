"use client";

import { useEffect } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function DocsPage() {
  useEffect(() => {
    console.warn = () => {}; // temporarily suppress console warnings
  }, []);

  return (
    <div style={{ height: "100vh" }}>
      <SwaggerUI url="/api/docs" />
    </div>
  );
}

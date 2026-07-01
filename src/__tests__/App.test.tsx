import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App Component", () => {

  test("renders pipeline heading", () => {
    render(<App />);

    expect(
      screen.getByText("CI/CD Pipeline")
    ).toBeInTheDocument();
  });

  test("renders testing project highlight", () => {
    render(<App />);

    expect(
      screen.getByText("Testing Project")
    ).toBeInTheDocument();
  });

  test("renders pipeline status button", () => {
    render(<App />);

    expect(
      screen.getByRole("button")
    ).toHaveTextContent("Pipeline Status: Running");
  });

  test("renders all technology tags", () => {
    render(<App />);

    expect(screen.getByText("Docker")).toBeInTheDocument();
    expect(screen.getByText("Tekton")).toBeInTheDocument();
    expect(screen.getByText("FluxCD")).toBeInTheDocument();
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
    expect(screen.getByText("Minikube")).toBeInTheDocument();
    expect(screen.getByText("GitOps")).toBeInTheDocument();
  });

  test("renders project description", () => {
    render(<App />);

    expect(
      screen.getByText(/This project Demonstrates/i)
    ).toBeInTheDocument();
  });

  test("renders image", () => {
    render(<App />);

    expect(
      screen.getByAltText("Nature")
    ).toBeInTheDocument();
  });

});
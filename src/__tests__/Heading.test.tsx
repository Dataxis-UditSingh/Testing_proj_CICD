import { render, screen } from "@testing-library/react";
import Heading from "../components/Heading";

describe("Heading Component", () => {

  test("renders title correctly", () => {
    render(<Heading title="CI/CD Pipeline" />);

    expect(
      screen.getByText("CI/CD Pipeline")
    ).toBeInTheDocument();
  });

  test("renders highlight when provided", () => {
    render(
      <Heading
        title="CI/CD Pipeline"
        highlight="Testing Project"
      />
    );

    expect(
      screen.getByText("Testing Project")
    ).toBeInTheDocument();
  });

  test("does not render highlight when not provided", () => {
    render(<Heading title="CI/CD Pipeline" />);

    expect(
      screen.queryByText("Testing Project")
    ).not.toBeInTheDocument();
  });

  test("applies custom className", () => {
    render(
      <Heading
        title="CI/CD Pipeline"
        className="custom-heading"
      />
    );

    expect(
      screen.getByRole("heading")
    ).toHaveClass("custom-heading");
  });

});
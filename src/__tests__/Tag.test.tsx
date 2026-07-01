import { render, screen } from "@testing-library/react";
import Tag from "../components/Tag";

describe("Tag Component", () => {

  test("renders tag text", () => {
    render(<Tag>Docker</Tag>);

    expect(
      screen.getByText("Docker")
    ).toBeInTheDocument();
  });

  test("applies custom className", () => {
    render(
      <Tag className="bg-red-500">
        Docker
      </Tag>
    );

    expect(
      screen.getByText("Docker")
    ).toHaveClass("bg-red-500");
  });

  test("renders multiple words", () => {
    render(<Tag>CI/CD Pipeline</Tag>);

    expect(
      screen.getByText("CI/CD Pipeline")
    ).toBeInTheDocument();
  });

});
import { render, screen } from "@testing-library/react";
import Button from "../components/Button";

describe("Button Component", () => {
    test("renders button with text", () => {
        render(<Button>Pipeline Status: Running</Button>);

        expect(
            screen.getByRole("button")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Pipeline Status: Running")
        ).toBeInTheDocument();
    });

    test("button disabled", () => {
        render(
            <Button disabled>
                Deploy
            </Button>
        )
        expect(
            screen.getByRole("button")
        ).toBeDisabled()
    })

    test("button click", () => {
        const handleClick = jest.fn()
        render(
            <Button onClick={handleClick}>
                Deploy
            </Button>
        )
    })
});
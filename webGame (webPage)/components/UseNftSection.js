import GoToButton from "./GoToButton"

export default function UseNftSection() {
    return (
        <section>
            <h3 style={{ marginLeft: 54 }}> CHALLENGE OTHER PLAYER!!! </h3>
            <GoToButton href="/mintPage" text="Mint a fighter!" />
            <input placeholder="bid ammount (>0.01 ETH)" />
            <br /> <br />
            <button
                style={{
                    color: "red",
                    background: "orange",
                    marginLeft: 110,
                    borderRadius: 12,
                    borderBlockColor: "purple",
                    blockSize: 45,
                }}
            >
                {" "}
                Challenge to a fight!!!{" "}
            </button>
        </section>
    )
}

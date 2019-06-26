export function monitorTx(txPromise) {
  window.toastProvider.addMessage("Confirm transaction using wallet...");
  txPromise
    .then(async tx => {
      console.log("tx: ", tx);
      window.toastProvider.removeMessage();
      window.toastProvider.addMessage("Transaction submitted!", {
        secondaryMessage: "Check progress on Etherscan",
        actionHref: `https://etherscan.io/tx/${tx.hash}`,
        actionText: "Check",
        variant: "processing"
      });
      await tx.wait();
      console.log("Tx wait complete");
      window.toastProvider.removeMessage();
      window.toastProvider.addMessage("Transaction Confirmed!", {
        secondaryMessage: "View on Etherscan",
        actionHref: `https://etherscan.io/tx/${tx.hash}`,
        actionText: "View",
        variant: "success"
      });
    })
    .catch(e => {
      console.log("e: ", e);
      window.toastProvider.removeMessage();
      window.toastProvider.addMessage("Error", {
        secondaryMessage: "Error occurred while processing transaction. Please try again later.",
        variant: "error"
      });
    });
};
function renderYesNoOptions(key, callback, yesText = 'Да', noText = 'Нет') {
  const chatContent = document.getElementById("chatContent");
  const responseContainer = document.createElement("div");
  responseContainer.className = "response-options";

  const yesBtn = document.createElement("button");
  yesBtn.type = 'button';
  yesBtn.className = "res-button-yes"
  yesBtn.innerHTML = yesText;
  yesBtn.onclick = () => {
    if (typeof callback === 'function') callback('yes', key);
    responseContainer.remove();
  };

  const noBtn = document.createElement("button");
  noBtn.type = 'button';
  noBtn.className = "res-button-no"
  noBtn.innerHTML = noText;
  noBtn.onclick = () => {
    if (typeof callback === 'function') callback('no', key);
    responseContainer.remove();
  };

  responseContainer.appendChild(yesBtn);
  responseContainer.appendChild(noBtn);
  chatContent.appendChild(responseContainer);

  if (typeof animateFadeIn === 'function') animateFadeIn(responseContainer);
  if (typeof smoothScrollToBottom === 'function') smoothScrollToBottom();

  window.lastOptions = responseContainer;
}

export default renderYesNoOptions; 
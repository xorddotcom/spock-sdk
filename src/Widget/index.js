import { WIDGET_ENDPOINT, WIDGET_RECEIVE_EVENTS } from '../constants';
import { addEvent } from '../utils/helpers';

const iframwStyles = {
  display: 'none',
  position: 'fixed',
  bottom: '3%',
  right: '3%',
  borderRadius: '0',
  border: 'none',
  width: '350px',
  zIndex: '2147483647',
};

function applyStyles(elemment) {
  for (const [cssProperty, value] of Object.entries(iframwStyles)) {
    elemment.style[cssProperty] = value;
  }
}

class WidgetController {
  constructor() {
    this.setUserDefinedOnClick = this.setUserDefinedOnClick.bind(this);
  }

  init(appKey) {
    const createIframe = () => {
      const iframe = document.createElement('iframe');
      iframe.src = WIDGET_ENDPOINT + `/?appKey=${appKey}`;
      iframe.title = 'Spock Widget';
      iframe.id = 'spock-widget';
      iframe.dataset.spockIframeLabel = new URL(WIDGET_ENDPOINT).host;
      applyStyles(iframe);
      document.body.appendChild(iframe);
      return iframe;
    };

    this.iframe = createIframe();

    addEvent(window, 'message', this.eventHandler.bind(this));
  }

  eventHandler(event) {
    const { origin, data } = event;
    if (origin === WIDGET_ENDPOINT) {
      switch (data?.message) {
        case WIDGET_RECEIVE_EVENTS.SHOW_POPUP:
          this.show(data?.body?.height);
          break;
        case WIDGET_RECEIVE_EVENTS.HIDE_POPUP:
          this.hide();
          break;
        case WIDGET_RECEIVE_EVENTS.BUTTON_CLICK:
          this.hide();
          if (data?.body?.redirectUrl) {
            window.location.href = data?.body?.redirectUrl;
          } else if (this.userDefinedClickMethod) {
            this.userDefinedClickMethod(data?.body);
          }
          break;
        default:
          break;
      }
    }
  }

  postMessage(message, body) {
    if (this.iframe && this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage({ message, body }, WIDGET_ENDPOINT);
    }
  }

  show(height) {
    this.iframe.style.height = height;
    this.iframe.style.display = 'block';
  }

  hide() {
    this.iframe.style.display = 'none';
  }

  setUserDefinedOnClick(method) {
    this.userDefinedClickMethod = method;
  }
}

export default new WidgetController();

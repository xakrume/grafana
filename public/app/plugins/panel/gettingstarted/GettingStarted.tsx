// Libraries
import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { Button, stylesFactory } from '@grafana/ui';
import { config } from '@grafana/runtime';
import { css, cx } from 'emotion';
import { contextSrv } from 'app/core/core';
import { backendSrv } from 'app/core/services/backend_srv';
import { getDashboardSrv } from 'app/features/dashboard/services/DashboardSrv';
import { Step } from './components/Step';
import { Help } from './components/Help';
import { getSteps } from './steps';
import { Card, SetupStep } from './types';
import { Branding } from 'app/core/components/Branding/Branding';

interface State {
  checksDone: boolean;
  currentStep: number;
  steps: SetupStep[];
}

export class GettingStarted extends PureComponent<PanelProps, State> {
  state = {
    checksDone: false,
    currentStep: 0,
    steps: getSteps(),
  };

  async componentDidMount() {
    const { steps } = this.state;

    const checkedStepsPromises: Array<Promise<SetupStep>> = steps.map(async (step: SetupStep) => {
      const checkedCardsPromises: Array<Promise<Card>> = step.cards.map((card: Card) => {
        return card.check().then(passed => {
          return { ...card, done: passed };
        });
      });
      const checkedCards = await Promise.all(checkedCardsPromises);
      return {
        ...step,
        done: checkedCards.every(c => c.done),
        cards: checkedCards,
      };
    });

    const checkedSteps = await Promise.all(checkedStepsPromises);

    this.setState({
      currentStep: !checkedSteps[0].done ? 0 : 1,
      steps: checkedSteps,
      checksDone: true,
    });
  }

  onForwardClick = () => {
    this.setState(prevState => ({
      currentStep: prevState.currentStep + 1,
    }));
  };

  onPreviousClick = () => {
    this.setState(prevState => ({
      currentStep: prevState.currentStep - 1,
    }));
  };

  dismiss = () => {
    const { id } = this.props;
    const dashboard = getDashboardSrv().getCurrent();
    const panel = dashboard.getPanelById(id);
    dashboard.removePanel(panel);
    backendSrv
      .request({
        method: 'PUT',
        url: '/api/user/helpflags/1',
        showSuccessAlert: false,
      })
      .then((res: any) => {
        contextSrv.user.helpFlags1 = res.helpFlags1;
      });
  };

  render() {
    const { checksDone, currentStep, steps } = this.state;

    if (!checksDone) {
      return <div>checking...</div>;
    }

    const styles = getStyles();
    const step = steps[currentStep];

    return (
      <div className={styles.container}>
        {currentStep === steps.length - 1 && (
          <div className={cx(styles.backForwardButtons, styles.previous)} onClick={this.onPreviousClick}>
            <Button icon="angle-left" variant="secondary" />
          </div>
        )}
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.heading}>
              <Branding.MenuLogo className={styles.headerLogo} />
              <div>
                <h1>{step.heading}</h1>
                <p>{step.subheading}</p>
              </div>
            </div>
            <Help />
          </div>
          <Step step={step} />
        </div>
        {currentStep < steps.length - 1 && (
          <div className={cx(styles.backForwardButtons, styles.forward)} onClick={this.onForwardClick}>
            <Button icon="angle-right" variant="secondary" />
          </div>
        )}
        <div className={styles.dismiss}>
          <Button size="sm" variant="secondary" onClick={this.dismiss}>
            Remove this panel
          </Button>
        </div>
      </div>
    );
  }
}

const getStyles = stylesFactory(() => {
  const { theme } = config;
  return {
    container: css`
      display: flex;
      flex-direction: column;
      height: 100%;
      background: url('public/img/login_background_dark.svg') no-repeat;
      background-size: cover;
    `,
    content: css`
      label: content;
      padding: ${theme.spacing.md};

      @media only screen and (min-width: ${theme.breakpoints.md}) {
        padding: ${theme.spacing.lg};
      }
    `,
    header: css`
      label: header;
      margin-bottom: ${theme.spacing.lg};
      display: flex;
      flex-direction: column;

      @media only screen and (min-width: ${theme.breakpoints.lg}) {
        flex-direction: row;
      }
    `,
    headerLogo: css`
      height: 58px;
      padding-right: ${theme.spacing.md};
      display: none;

      @media only screen and (min-width: ${theme.breakpoints.md}) {
        display: block;
      }
    `,
    heading: css`
      label: heading;
      margin-right: ${theme.spacing.lg};
      margin-bottom: ${theme.spacing.lg};
      flex-grow: 1;
      display: flex;

      @media only screen and (min-width: ${theme.breakpoints.md}) {
        margin-bottom: 0;
      }
    `,
    backForwardButtons: css`
      position: absolute;
      bottom: 150px;
      height: 50px;

      @media only screen and (max-width: ${theme.breakpoints.lg}) {
        display: none;
      }
    `,
    previous: css`
      left: 30px;
    `,
    forward: css`
      right: 30px;
    `,
    dismiss: css`
      display: flex;
      justify-content: center;
      position: absolute;
      bottom: 16px;
      right: 50%;
      left: 50%;
    `,
  };
});

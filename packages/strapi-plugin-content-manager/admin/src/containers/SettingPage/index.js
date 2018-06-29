/**
 * 
 * SettingPage
 */

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { get, last, upperFirst } from 'lodash';
import cn from 'classnames';

import PropTypes from 'prop-types';

import { onChangeSettings, onSubmit, onReset } from 'containers/App/actions';
import { makeSelectModifiedSchema } from 'containers/App/selectors';

import BackHeader from 'components/BackHeader';
import Input from 'components/InputsIndex';
import PluginHeader from 'components/PluginHeader';
import PopUpWarning from 'components/PopUpWarning';

import Block from 'components/Block';

import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';

import forms from './forms.json';
import reducer from './reducer';
import saga from './saga';
import makeSelectSettingPage from './selectors';
import styles from './styles.scss';


class SettingPage extends React.PureComponent {
  state = { showWarning: false };

  getModelName = () => {
    const { match: { params: { slug } } } = this.props;

    return last(slug.split('::'));
  }

  getPath = () => {
    const { match: { params: { slug } } } = this.props;

    return slug.split('::').join('.');
  }

  getSelectOptions = (input) => {
    const { schema: { models } } = this.props;
    const currentAttributes = models[this.getModelName()].attributes;
    const selectOptions = [models[this.getModelName()].primaryKey]
      .concat(Object.keys(currentAttributes)
        .filter(attr => currentAttributes[attr].type !== 'json' && currentAttributes[attr].type !== 'array'));
    
    return input.name === 'defaultSort' ? selectOptions : input.selectOptions;
  }

  getPluginHeaderActions = () => (
    [
      {
        label: 'content-manager.popUpWarning.button.cancel',
        kind: 'secondary',
        onClick: this.props.onReset,
        type: 'button',
      },
      {
        kind: 'primary',
        label: 'content-manager.containers.Edit.submit',
        onClick: this.handleSubmit,
        type: 'submit',
      },
    ]
  );

  getValue = (keys, type) => {
    const value =  get(this.props.schema, ['models'].concat(keys.split('.')));

    return type === 'toggle' ? value : value.toString();

  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ showWarning: true });
  }

  toggle = () => this.setState(prevState => ({ showWarning: !prevState.showWarning }));

  render() {
    const { showWarning } = this.state;
    const { onChangeSettings, onSubmit } = this.props;
    const namePath = this.getPath();

    return (
      <React.Fragment>
        <BackHeader onClick={() => this.props.history.goBack()} />
        <div className={cn('container-fluid', styles.containerFluid)}>
          <PluginHeader
            actions={this.getPluginHeaderActions()}
            title={`Content Manager - ${upperFirst(this.getModelName())}`}
            description={{ id: 'content-manager.containers.SettingPage.pluginHeaderDescription' }}
          />
          <PopUpWarning
            isOpen={showWarning}
            toggleModal={this.toggle}
            content={{
              title: 'content-manager.popUpWarning.title',
              message: 'content-manager.popUpWarning.warning.updateAllSettings',
              cancel: 'content-manager.popUpWarning.button.cancel',
              confirm: 'content-manager.popUpWarning.button.confirm',
            }}
            popUpWarningType="danger"
            onConfirm={() => {
              onSubmit();
              this.toggle();
            }}
          />
          <div className={cn('row', styles.container)}>
            <Block
              description="content-manager.containers.SettingPage.listSettings.description"
              title="content-manager.containers.SettingPage.listSettings.title"
            >
              <form onSubmit={this.handleSubmit} className={styles.ctmForm}>
                <div className="row">
                  <div className="col-md-10">
                    <div className="row">
                      {forms.inputs.map(input => {
                        const inputName = `${namePath}.${input.name}`;

                        return (
                          <Input
                            {...input}
                            key={input.name}
                            name={inputName}
                            onChange={onChangeSettings}
                            selectOptions={this.getSelectOptions(input)}
                            value={this.getValue(inputName, input.type)}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </form>
            </Block>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

SettingPage.defaultProps = {};

SettingPage.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  onChangeSettings: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  schema: PropTypes.object.isRequired,
};

const mapDispatchToProps = (dispatch) => (
  bindActionCreators(
    {
      onChangeSettings,
      onReset,
      onSubmit,
    },
    dispatch,
  )
);

const mapStateToProps = createStructuredSelector({
  schema: makeSelectModifiedSchema(),
  settingPage: makeSelectSettingPage(),
});

const withConnect = connect(mapStateToProps, mapDispatchToProps);
const withReducer = injectReducer({ key: 'settingPage', reducer });
const withSaga = injectSaga({ key: 'settingPage', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(SettingPage);

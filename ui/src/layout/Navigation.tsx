import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {StyleRules, Theme, WithStyles, withStyles} from '@material-ui/core/styles';
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {observer} from 'mobx-react';
import {inject, Stores} from '../inject';
import {mayAllowPermission, requestPermission} from '../snack/browserNotification';
import {Button, Hidden, IconButton, Typography} from '@material-ui/core';
import {DrawerProps} from "@material-ui/core/Drawer/Drawer";
import CloseIcon from '@material-ui/icons/Close';

const styles = (theme: Theme): StyleRules<'drawerPaper' | 'toolbar' | 'link'> => ({
    drawerPaper: {
        position: 'relative',
        width: 250,
        minHeight: '100%',
        height: '100vh',
    },
    toolbar: theme.mixins.toolbar,
    link: {
        color: 'inherit',
        textDecoration: 'none',
    },
});

type Styles = WithStyles<'drawerPaper' | 'toolbar' | 'link'>;

interface IProps {
    loggedIn: boolean;
    navOpen: boolean;
    setNavOpen: (open: boolean) => void;
}

@observer
class Navigation extends Component<
    IProps & Styles & Stores<'appStore'>,
    {showRequestNotification: boolean}
> {
    public state = {showRequestNotification: mayAllowPermission()};

    public render() {
        const {classes, loggedIn, appStore, navOpen, setNavOpen} = this.props;
        const {showRequestNotification} = this.state;
        const apps = appStore.getItems();

        const userApps =
            apps.length === 0
                ? null
                : apps.map((app) => {
                      return (
                          <Link
                              className={`${classes.link} item`}
                              to={'/messages/' + app.id}
                              key={app.id}>
                              <ListItem button>
                                  <ListItemText primary={app.name} />
                              </ListItem>
                          </Link>
                      );
                  });

        const placeholderItems = [
            <ListItem button disabled key={-1}>
                <ListItemText primary="Some Server" />
            </ListItem>,
            <ListItem button disabled key={-2}>
                <ListItemText primary="A Raspberry PI" />
            </ListItem>,
        ];

        return (
            <ResponsiveDrawer
                classes={{paper: classes.drawerPaper}}
                navOpen={navOpen}
                setNavOpen={setNavOpen}
                id="message-navigation">
                <div className={classes.toolbar} />
                <Link className={classes.link} to="/">
                    <ListItem button disabled={!loggedIn} className="all">
                        <ListItemText primary="All Messages" />
                    </ListItem>
                </Link>
                <Divider />
                <div>{loggedIn ? userApps : placeholderItems}</div>
                <Divider />
                <Typography align="center" style={{marginTop: 10}}>
                    {showRequestNotification ? (
                        <Button
                            onClick={() => {
                                requestPermission();
                                this.setState({showRequestNotification: false});
                            }}>
                            Enable Notifications
                        </Button>
                    ) : null}
                </Typography>
            </ResponsiveDrawer>
        );
    }
}

const ResponsiveDrawer: React.FC<DrawerProps & {navOpen: boolean, setNavOpen: (open: boolean) => void} > = ({navOpen, setNavOpen, children, ...rest}) => {
    return (
        <>
            <Hidden smUp implementation="css">
                <Drawer variant="temporary" open={navOpen} {...rest} >
                    <IconButton onClick={() => setNavOpen(false)}><CloseIcon/></IconButton>
                    {children}
                </Drawer>
            </Hidden>
            <Hidden xsDown implementation="css">
                <Drawer variant="permanent" {...rest} >
                    {children}
                </Drawer>
            </Hidden>
        </>
    );
};

export default withStyles(styles, {withTheme: true})(inject('appStore')(Navigation));
